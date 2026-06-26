const express = require('express');
const mysql = require('mysql2/promise');
const session = require('express-session');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARES ---
app.use(cors({
    origin: true, // Adjust this to your frontend URL in production
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session Configuration
app.use(session({
    secret: 'waste_management_secret_key_123!',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

// --- DATABASE CONNECTION ---
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'waste_management_system'
};

let db;
async function connectDB() {
    try {
        db = await mysql.createPool(dbConfig);
        console.log('✅ Connected to MySQL Database successfully.');
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
}
connectDB();

// --- AUTHENTICATION MIDDLEWARE ---
const checkAuth = (roles = []) => {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Unauthorized. Please log in.' });
        }
        if (roles.length && !roles.includes(req.session.user.role)) {
            return res.status(403).json({ error: 'Forbidden. You do not have permission.' });
        }
        next();
    };
};


// ==========================================
// 1. AUTHENTICATION ROUTES (users table)
// ==========================================

// Register User
app.post('/api/auth/register', async (req, res) => {
    const { fullname, email, phone, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.execute(
            `INSERT INTO users (fullname, email, phone, password, role) VALUES (?, ?, ?, ?, ?)`,
            [fullname, email, phone, hashedPassword, role || 'resident']
        );
        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ==========================================
// AUTH ROUTES - Login (YARI IBURA)
// ==========================================
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // 1. Find user by email
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = rows[0];
        
        // 2. Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // 3. Save session
        req.session.user = { 
            id: user.user_id, 
            fullname: user.fullname, 
            role: user.role,
            email: user.email,
            phone: user.phone
        };

        // 4. Return user data (without password)
        res.json({ 
            message: 'Login successful', 
            user: {
                id: user.user_id,
                fullname: user.fullname,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
        
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error during login' });
    }
});
// ==========================================
// RESET PASSWORD - Using token
// ==========================================
app.post('/api/auth/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    try {
        // 1. Find user with valid token
        const [user] = await db.execute(
            'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
            [token]
        );

        if (user.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        // 2. Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 3. Update password and clear token
        await db.execute(
            'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE user_id = ?',
            [hashedPassword, user[0].user_id]
        );

        res.json({ message: 'Password reset successfully' });

    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});


// ==========================================
// 2. CRUD: USERS
// ==========================================
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT user_id, fullname, email, phone, role, created_at FROM users');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/users/:id', async (req, res) => {
    const { fullname, email, phone, role } = req.body;
    try {
        await db.execute('UPDATE users SET fullname=?, email=?, phone=?, role=? WHERE user_id=?', [fullname, email, phone, role, req.params.id]);
        res.json({ message: 'User updated successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM users WHERE user_id=?', [req.params.id]);
        res.json({ message: 'User deleted successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// ==========================================
// 3. CRUD: RESIDENTS
// ==========================================
app.post('/api/residents', async (req, res) => {
    const { user_id, address } = req.body;
    try {
        const [reslt] = await db.execute('INSERT INTO residents (user_id, address) VALUES (?,?)', [user_id, address]);
        res.status(201).json({ message: 'Resident profile created', resident_id: reslt.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/residents', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM residents');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/residents/:id', async (req, res) => {
    const { address } = req.body;
    try {
        await db.execute('UPDATE residents SET address=? WHERE resident_id=?', [address, req.params.id]);
        res.json({ message: 'Resident updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/residents/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM residents WHERE resident_id=?', [req.params.id]);
        res.json({ message: 'Resident profile deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// ==========================================
// 4. CRUD: COLLECTORS
// ==========================================
app.post('/api/collectors', async (req, res) => {
    const { user_id, employee_number } = req.body;
    try {
        const [r] = await db.execute('INSERT INTO collectors (user_id, employee_number) VALUES (?,?)', [user_id, employee_number]);
        res.status(201).json({ id: r.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/collectors', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM collectors');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/collectors/:id', async (req, res) => {
    const { employee_number } = req.body;
    try {
        await db.execute('UPDATE collectors SET employee_number=? WHERE collector_id=?', [employee_number, req.params.id]);
        res.json({ message: 'Collector updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/collectors/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM collectors WHERE collector_id=?', [req.params.id]);
        res.json({ message: 'Collector deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// ==========================================
// 5. CRUD: RECYCLING STAFF
// ==========================================
app.post('/api/recycling-staff', async (req, res) => {
    const { user_id, center_id, employee_number } = req.body;
    try {
        const [r] = await db.execute('INSERT INTO recycling_staff (user_id, center_id, employee_number) VALUES (?,?,?)', [user_id, center_id, employee_number]);
        res.status(201).json({ id: r.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/recycling-staff', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM recycling_staff');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/recycling-staff/:id', async (req, res) => {
    const { center_id, employee_number } = req.body;
    try {
        await db.execute('UPDATE recycling_staff SET center_id=?, employee_number=? WHERE staff_id=?', [center_id, employee_number, req.params.id]);
        res.json({ message: 'Staff updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/recycling-staff/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM recycling_staff WHERE staff_id=?', [req.params.id]);
        res.json({ message: 'Staff profile deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// ==========================================
// 6. CRUD: RECYCLING CENTERS
// ==========================================
app.post('/api/recycling-centers', async (req, res) => {
    const { center_name, location, contact_phone } = req.body;
    try {
        const [r] = await db.execute('INSERT INTO recycling_centers (center_name, location, contact_phone) VALUES (?,?,?)', [center_name, location, contact_phone]);
        res.status(201).json({ id: r.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/recycling-centers', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM recycling_centers');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/recycling-centers/:id', async (req, res) => {
    const { center_name, location, contact_phone } = req.body;
    try {
        await db.execute('UPDATE recycling_centers SET center_name=?, location=?, contact_phone=? WHERE center_id=?', [center_name, location, contact_phone, req.params.id]);
        res.json({ message: 'Center info updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/recycling-centers/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM recycling_centers WHERE center_id=?', [req.params.id]);
        res.json({ message: 'Center deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// ==========================================
// 7. CRUD: WASTE REQUESTS
// ==========================================
app.post('/api/waste-requests', async (req, res) => {
    const { resident_id, waste_type, description, image, location, status } = req.body;
    
    try {
        const userId = parseInt(resident_id, 10);

        let [residentRows] = await db.execute(
            'SELECT resident_id FROM residents WHERE user_id = ?', 
            [userId]
        );

        let actualResidentId;

        if (residentRows.length === 0) {
            const [newResident] = await db.execute(
                'INSERT INTO residents (user_id, address) VALUES (?, ?)',
                [userId, location || 'Kigali, Rwanda']
            );
            actualResidentId = newResident.insertId;
        } else {
            actualResidentId = residentRows[0].resident_id;
        }

        const finalImage = (image === null || image === undefined) ? '' : image;
        const [r] = await db.execute(
            'INSERT INTO waste_requests (resident_id, waste_type, description, image, location, request_date, status) VALUES (?,?,?,?,?, NOW(),?)',
            [
                actualResidentId, 
                waste_type || 'organic', 
                description, 
                finalImage, 
                location, 
                status || 'pending'
            ]
        );
        
        return res.status(201).json({ request_id: r.insertId });
        
    } catch (err) {
        console.error('❌ SQL Error:', err);
        return res.status(500).json({ error: 'Database rejected', sqlMessage: err.sqlMessage || err.message });
    }
});

app.get('/api/waste-requests', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM waste_requests');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/waste-requests/:id', async (req, res) => {
    const { waste_type, description, image, location, status } = req.body;
    try {
        await db.execute(
            'UPDATE waste_requests SET waste_type=?, description=?, image=?, location=?, status=? WHERE request_id=?',
            [waste_type, description, image || '', location, status, req.params.id]
        );
        res.json({ message: 'Waste request updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/waste-requests/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM waste_requests WHERE request_id=?', [req.params.id]);
        res.json({ message: 'Waste request dropped' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// ==========================================
// 8. CRUD: COLLECTION SCHEDULES
// ==========================================
app.post('/api/collection-schedules', async (req, res) => {
    const { request_id, collector_id, vehicle_id, collection_date, collection_time, status } = req.body;
    try {
        const [r] = await db.execute(
            'INSERT INTO collection_schedules (request_id, collector_id, vehicle_id, collection_date, collection_time, status) VALUES (?,?,?,?,?,?)',
            [request_id, collector_id, vehicle_id, collection_date, collection_time, status || 'scheduled']
        );
        res.status(201).json({ schedule_id: r.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/collection-schedules', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM collection_schedules');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/collection-schedules/:id', async (req, res) => {
    const { request_id, collector_id, vehicle_id, collection_date, collection_time, status } = req.body;
    try {
        await db.execute(
            'UPDATE collection_schedules SET request_id=?, collector_id=?, vehicle_id=?, collection_date=?, collection_time=?, status=? WHERE schedule_id=?',
            [request_id, collector_id, vehicle_id, collection_date, collection_time, status, req.params.id]
        );
        res.json({ message: 'Schedule updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/collection-schedules/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM collection_schedules WHERE schedule_id=?', [req.params.id]);
        res.json({ message: 'Schedule removed' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// ==========================================
// 9. CRUD: VEHICLES
// ==========================================
app.post('/api/vehicles', async (req, res) => {
    const { plate_number, vehicle_type, capacity, status } = req.body;
    try {
        const [r] = await db.execute('INSERT INTO vehicles (plate_number, vehicle_type, capacity, status) VALUES (?,?,?,?)', [plate_number, vehicle_type, capacity, status || 'available']);
        res.status(201).json({ vehicle_id: r.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/vehicles', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM vehicles');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/vehicles/:id', async (req, res) => {
    const { plate_number, vehicle_type, capacity, status } = req.body;
    try {
        await db.execute('UPDATE vehicles SET plate_number=?, vehicle_type=?, capacity=?, status=? WHERE vehicle_id=?', [plate_number, vehicle_type, capacity, status, req.params.id]);
        res.json({ message: 'Vehicle details modified' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/vehicles/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM vehicles WHERE vehicle_id=?', [req.params.id]);
        res.json({ message: 'Vehicle dropped' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// ♻️ RECYCLED MATERIALS ENDPOINTS
// ==========================================

// 1. KWANDIKA IMYANDA MINSHYA YAKIRIWE (POST)
// Iyi ikoreshwa na Recycling Staff iyo agize imyanda itunganywa yakira
app.post('/api/recycled-materials', async (req, res) => {
    const { center_id, request_id, material_type, quantity } = req.body;

    // Validation y'ibanze
    if (!center_id || !material_type || !quantity) {
        return res.status(400).json({ error: "Missing required fields: center_id, material_type, and quantity." });
    }

    try {
        const [result] = await db.execute(
            `INSERT INTO recycled_materials (center_id, request_id, material_type, quantity) 
             VALUES (?, ?, ?, ?)`,
            [center_id, request_id || null, material_type, quantity]
        );
        
        res.status(201).json({ 
            message: 'Recycled material logged successfully!', 
            materialId: result.insertId 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. KUZANA IMYANDA YOSE YANDIKITSE (GET)
// Iyi izajya yerekana n'izina rya Center baturutsemo (JOIN)
app.get('/api/recycled-materials', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT rm.*, c.center_name 
            FROM recycled_materials rm
            JOIN centers c ON rm.center_id = c.center_id
            ORDER BY rm.date_received DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. GUHINDURA AMACURU Y'IMYANDA (PUT)
app.put('/api/recycled-materials/:id', async (req, res) => {
    const { id } = req.params;
    const { center_id, request_id, material_type, quantity } = req.body;
    
    try {
        await db.execute(
            `UPDATE recycled_materials 
             SET center_id = ?, request_id = ?, material_type = ?, quantity = ? 
             WHERE material_id = ?`,
            [center_id, request_id || null, material_type, quantity, id]
        );
        res.json({ message: 'Recycled material record updated successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. GUSIBA INYANDIKO (DELETE)
app.delete('/api/recycled-materials/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM recycled_materials WHERE material_id = ?', [id]);
        res.json({ message: 'Recycled material record deleted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. GUHINDURA INYANDIKO Y'IMYANDA YAKIRIWE (PUT / UPDATE)
app.put('/api/recycled-materials/:id', async (req, res) => {
    const { id } = req.params; // Ihawe material_id binyuze mu muhanda (URL)
    const { center_id, request_id, material_type, quantity } = req.body;

    // --- 1. VALIDATION SYSTEM ---
    if (!center_id || !material_type || quantity === undefined) {
        return res.status(400).json({ 
            error: "Missing fields! center_id, material_type, and quantity are strictly required." 
        });
    }

    if (isNaN(quantity) || Number(quantity) <= 0) {
        return res.status(400).json({ 
            error: "Invalid input! Quantity must be a positive number greater than 0." 
        });
    }

    try {
        // --- 2. EXECUTE DATABASE UPDATE ---
        const [result] = await db.execute(
            `UPDATE recycled_materials 
             SET center_id = ?, request_id = ?, material_type = ?, quantity = ? 
             WHERE material_id = ?`,
            [center_id, request_id || null, material_type, quantity, id]
        );

        // --- 3. VERIFY IF RECORD EXISTED ---
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                error: `Update failed. Recycled material record with ID ${id} was not found.` 
            });
        }

        res.json({ 
            message: 'Recycled material log updated successfully!',
            updatedId: id 
        });

    } catch (err) {
        // Handle Foreign Key constraints failures (e.g., center_id doesn't exist)
        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ 
                error: "Database Integrity Error: The provided center_id or request_id does not exist." 
            });
        }
        res.status(500).json({ error: err.message });
    }
});

// =========================================================================
// 1. ADMIN ENDPOINT: Kohereza Notification ku mukoresha runaka cyangwa Bose
// =========================================================================
app.post('/api/notifications', async (req, res) => {
    const { user_id, title, message } = req.body;

    if (!title || !message) {
        return res.status(400).json({ error: "Umutwe (title) n'Ubutumwa (message) bishyirwemo." });
    }

    try {
        // Niba user_id ihari tuyishyiramo, niba idahari ihaba NULL (ireba bose)
        await db.execute(
            'INSERT INTO notifications (user_id, title, message, is_read, sender_id) VALUES (?, ?, ?, 0, NULL)',
            [user_id || null, title, message]
        );
        res.status(201).json({ message: "Notification yoherejwe neza!" });
    } catch (err) {
        console.error("❌ Ikosa muri POST /api/notifications:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// DELETE endpoint - Delete a notification by ID
app.delete('/api/notifications/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        // Check if notification exists first
        const [existing] = await db.query(
            'SELECT * FROM notifications WHERE notification_id = ?', 
            [id]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({ 
                error: 'Notification not found',
                details: `No notification found with ID: ${id}`
            });
        }
        
        // Delete the notification
        const [result] = await db.query(
            'DELETE FROM notifications WHERE notification_id = ?', 
            [id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(500).json({ 
                error: 'Failed to delete notification' 
            });
        }
        
        res.status(200).json({ 
            message: 'Notification deleted successfully',
            notification_id: id
        });
        
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ 
            error: 'Database error occurred while deleting notification',
            details: error.message
        });
    }
});

// =========================================================================
// 2. NEW OVERRIDE ROUTE: Iza Admin gusa (IYI IGOMBA KUZA JURU rya :userId)
// =========================================================================
app.get('/api/notifications/admin', async (req, res) => {
    try {
        // Admin izakozwe na Admin gusa (Aho sender_id ari NULL cyangwa 1)
        const [rows] = await db.execute(
            'SELECT * FROM notifications WHERE sender_id IS NULL OR sender_id = 1 ORDER BY created_at DESC' 
        );
        res.json(rows);
    } catch (err) {
        console.error("❌ Ikosa muri GET /notifications/admin:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// =========================================================================
// 3. NEW OVERRIDE ROUTE: Iza Team gusa (IYI NAYO IGOMBA KUZA JURU rya :userId)
// =========================================================================
app.get('/api/notifications/team', async (req, res) => {
    try {
        // Izakozwe n'abandi bakozi (sender_id itari null kandi itari 1)
        const [rows] = await db.execute(
            'SELECT * FROM notifications WHERE sender_id IS NOT NULL AND sender_id != 1 ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (err) {
        console.error("❌ Ikosa muri GET /notifications/team:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// =========================================================================
// 4. COLLECTOR ENDPOINT: Kuzana notifications z'umuntu winjiye (Dushingiye kuri user_id)
// =========================================================================
app.get('/api/notifications/user/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Twahinduye umuhanda twongeyeho /user/:userId kugira ngo Express itayivanga n'izindi
        const [rows] = await db.execute(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        res.json(rows);
    } catch (err) {
        console.error("❌ Ikosa muri GET /notifications/user/:userId:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// =========================================================================
// 5. UPDATE ENDPOINT: Mark as Read
// =========================================================================
app.put('/api/notifications/read/:notificationId', async (req, res) => {
    const { notificationId } = req.params;

    try {
        await db.execute(
            'UPDATE notifications SET is_read = 1 WHERE notification_id = ?',
            [notificationId]
        );
        res.json({ message: "Notification marked as read." });
    } catch (err) {
        console.error("❌ Ikosa muri PUT /notifications/read:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// =========================================================================
// 6. GET ALL NOTIFICATIONS (FOR ADMIN/DASHBOARD VIEW)
// =========================================================================
app.get('/api/notifications', async (req, res) => {
    try {
        // Nkoze SELECT * ihabnye neza cyangwa nshoramo inkingi zose zizwi
        const query = `SELECT * FROM notifications ORDER BY notification_id DESC`;
        const [rows] = await db.execute(query);
        res.status(200).json(rows);
    } catch (err) {
        console.error("❌ Ikosa ryo kuzana zose:", err.message);
        res.status(500).json({ error: "Kuzana amakuru byanze", details: err.message });
    }
});




// ==========================================
// NOTIFICATION SYSTEM FOR COLLECTORS & ADMIN
// ==========================================

// 1. KOHEREZA NOTIFICATION: Collector ayoherereza abandi bakozi
app.post('/api/collector-notifications', async (req, res) => {
    const { sender_id, title, message } = req.body; 

    if (!sender_id || !title || !message) {
        return res.status(400).json({ error: "Byose bikenewe: sender_id, title, na message." });
    }

    try {
        // Niba muri database yawe column yitwa id cyangwa notification_id, reba niba is_read ifite default 0
        // Niba database yawe isaba user_id (NOT NULL), dushobora kuyihaho default nka 0 cyangwa NULL
        await db.execute(
            'INSERT INTO notifications (sender_id, title, message, is_read) VALUES (?, ?, ?, 0)',
            [sender_id, title, message]
        );
        res.status(201).json({ message: "Notification yoherejwe neza!" });
    } catch (err) {
        console.error("🚨 SQL ERROR MURI POST NOTIFICATION:", err.message); // Ibi bizakwerekera ikibazo nya cyo muri terminal ya node
        res.status(500).json({ error: "Database error: " + err.message });
    }
});

// 2. [YARI IBURA - FIXED] KUZANA IZO UYU MUKOZI YOHEREJE GUSA
app.get('/api/my-sent-notifications/:senderId', async (req, res) => {
    const { senderId } = req.params;
    try {
        const [rows] = await db.execute(
            'SELECT * FROM notifications WHERE sender_id = ? ORDER BY created_at DESC',
            [senderId]
        );
        res.json(rows);
    } catch (err) {
        console.error("🚨 SQL ERROR MURI GET MY SENT:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 3. KUZANA IZA ADMIN: Zireba abakozi bose (sender_id ni NULL cyangwa ni 1)
app.get('/api/notifications/admin', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM notifications WHERE sender_id IS NULL OR sender_id = 1 ORDER BY created_at DESC' 
        );
        res.json(rows);
    } catch (err) {
        console.error("🚨 SQL ERROR MURI GET ADMIN NOTIF:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 4. KUZANA IZA TEAM: Izakozwe n'abandi ba Collectors cyangwa Staff
app.get('/api/notifications/team', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM notifications WHERE sender_id IS NOT NULL AND sender_id != 1 ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (err) {
        console.error("🚨 SQL ERROR MURI GET TEAM NOTIF:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 5. GUHINDURA (UPDATE): Guhindura message cyangwa title
app.put('/api/notifications/update/:notificationId', async (req, res) => {
    const { notificationId } = req.params;
    const { title, message } = req.body;
    try {
        // NITONGARE: Reba niba column yitwa 'notification_id' cyangwa 'id' muri database yawe!
        await db.execute(
            'UPDATE notifications SET title = ?, message = ? WHERE notification_id = ?',
            [title, message, notificationId]
        );
        res.json({ message: "Notification yahinduwe neza." });
    } catch (err) {
        console.error("🚨 SQL ERROR MURI UPDATE:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 6. GUSIBA (DELETE): Gusiba notification burundu
app.delete('/api/notifications/delete/:notificationId', async (req, res) => {
    const { notificationId } = req.params;
    try {
        // NITONGARE: Reba niba column yitwa 'notification_id' cyangwa 'id'
        await db.execute('DELETE FROM notifications WHERE notification_id = ?', [notificationId]);
        res.json({ message: "Notification yasibwe neza." });
    } catch (err) {
        console.error("🚨 SQL ERROR MURI DELETE:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 10. REPORT ENDPOINTS
// ==========================================

// ==========================================
// 10.1 DAILY REPORT
// ==========================================
app.get('/api/reports/daily', async (req, res) => {
    const { date } = req.query; // Format: YYYY-MM-DD
    
    try {
        const reportDate = date || new Date().toISOString().split('T')[0];
        
        // Get waste requests for the day
        const [requests] = await db.execute(
            `SELECT 
                COUNT(*) as total_requests,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
            FROM waste_requests 
            WHERE DATE(request_date) = ?`,
            [reportDate]
        );
        
        // Get waste types breakdown
        const [wasteTypes] = await db.execute(
            `SELECT waste_type, COUNT(*) as count 
            FROM waste_requests 
            WHERE DATE(request_date) = ?
            GROUP BY waste_type`,
            [reportDate]
        );
        
        // Get top locations
        const [locations] = await db.execute(
            `SELECT location, COUNT(*) as count 
            FROM waste_requests 
            WHERE DATE(request_date) = ?
            GROUP BY location 
            ORDER BY count DESC 
            LIMIT 5`,
            [reportDate]
        );
        
        // Get collection status
        const [collections] = await db.execute(
            `SELECT COUNT(*) as total_collections 
            FROM collection_schedules 
            WHERE DATE(collection_date) = ?`,
            [reportDate]
        );
        
        res.json({
            report_type: 'daily',
            date: reportDate,
            summary: {
                total_requests: requests[0]?.total_requests || 0,
                pending: requests[0]?.pending || 0,
                approved: requests[0]?.approved || 0,
                completed: requests[0]?.completed || 0,
                cancelled: requests[0]?.cancelled || 0,
                total_collections: collections[0]?.total_collections || 0
            },
            waste_types: wasteTypes,
            top_locations: locations,
            generated_at: new Date().toISOString()
        });
        
    } catch (err) {
        console.error('Error generating daily report:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 10.2 WEEKLY REPORT
// ==========================================
app.get('/api/reports/weekly', async (req, res) => {
    const { week_start } = req.query; // Format: YYYY-MM-DD
    
    try {
        let startDate;
        if (week_start) {
            startDate = new Date(week_start);
        } else {
            startDate = new Date();
            startDate.setDate(startDate.getDate() - startDate.getDay());
        }
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        
        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];
        
        // Daily breakdown for the week
        const [dailyBreakdown] = await db.execute(
            `SELECT 
                DATE(request_date) as date,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
            FROM waste_requests 
            WHERE DATE(request_date) BETWEEN ? AND ?
            GROUP BY DATE(request_date)
            ORDER BY DATE(request_date)`,
            [startStr, endStr]
        );
        
        // Weekly summary
        const [summary] = await db.execute(
            `SELECT 
                COUNT(*) as total_requests,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
            FROM waste_requests 
            WHERE DATE(request_date) BETWEEN ? AND ?`,
            [startStr, endStr]
        );
        
        // Waste type breakdown for week
        const [wasteTypes] = await db.execute(
            `SELECT waste_type, COUNT(*) as count 
            FROM waste_requests 
            WHERE DATE(request_date) BETWEEN ? AND ?
            GROUP BY waste_type
            ORDER BY count DESC`,
            [startStr, endStr]
        );
        
        // Top collectors
        const [topCollectors] = await db.execute(
            `SELECT 
                u.fullname,
                COUNT(cs.collector_id) as collections
            FROM collection_schedules cs
            JOIN collectors c ON cs.collector_id = c.collector_id
            JOIN users u ON c.user_id = u.user_id
            WHERE DATE(cs.collection_date) BETWEEN ? AND ?
            GROUP BY cs.collector_id
            ORDER BY collections DESC
            LIMIT 5`,
            [startStr, endStr]
        );
        
        res.json({
            report_type: 'weekly',
            week_start: startStr,
            week_end: endStr,
            summary: {
                total_requests: summary[0]?.total_requests || 0,
                pending: summary[0]?.pending || 0,
                approved: summary[0]?.approved || 0,
                completed: summary[0]?.completed || 0,
                cancelled: summary[0]?.cancelled || 0
            },
            daily_breakdown: dailyBreakdown,
            waste_types: wasteTypes,
            top_collectors: topCollectors,
            generated_at: new Date().toISOString()
        });
        
    } catch (err) {
        console.error('Error generating weekly report:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 10.3 MONTHLY REPORT
// ==========================================
app.get('/api/reports/monthly', async (req, res) => {
    const { year, month } = req.query;
    
    try {
        const currentDate = new Date();
        const reportYear = parseInt(year) || currentDate.getFullYear();
        const reportMonth = parseInt(month) || currentDate.getMonth() + 1;
        
        const startDate = `${reportYear}-${String(reportMonth).padStart(2, '0')}-01`;
        const endDate = new Date(reportYear, reportMonth, 0).toISOString().split('T')[0];
        
        // Monthly summary
        const [summary] = await db.execute(
            `SELECT 
                COUNT(*) as total_requests,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
            FROM waste_requests 
            WHERE DATE(request_date) BETWEEN ? AND ?`,
            [startDate, endDate]
        );
        
        // Weekly breakdown
        const [weeklyBreakdown] = await db.execute(
            `SELECT 
                WEEK(request_date, 1) as week_number,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
            FROM waste_requests 
            WHERE DATE(request_date) BETWEEN ? AND ?
            GROUP BY WEEK(request_date, 1)
            ORDER BY week_number`,
            [startDate, endDate]
        );
        
        // Waste type summary
        const [wasteTypes] = await db.execute(
            `SELECT waste_type, COUNT(*) as count 
            FROM waste_requests 
            WHERE DATE(request_date) BETWEEN ? AND ?
            GROUP BY waste_type
            ORDER BY count DESC`,
            [startDate, endDate]
        );
        
        // Location performance
        const [locations] = await db.execute(
            `SELECT 
                location, 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count
            FROM waste_requests 
            WHERE DATE(request_date) BETWEEN ? AND ?
            GROUP BY location
            ORDER BY total DESC
            LIMIT 5`,
            [startDate, endDate]
        );
        
        // Collector performance
        const [collectors] = await db.execute(
            `SELECT 
                u.fullname,
                COUNT(cs.collector_id) as total_collections,
                COUNT(DISTINCT DATE(cs.collection_date)) as active_days
            FROM collection_schedules cs
            JOIN collectors c ON cs.collector_id = c.collector_id
            JOIN users u ON c.user_id = u.user_id
            WHERE DATE(cs.collection_date) BETWEEN ? AND ?
            GROUP BY cs.collector_id
            ORDER BY total_collections DESC`,
            [startDate, endDate]
        );
        
        // Center performance
        const [centers] = await db.execute(
            `SELECT 
                rc.center_name,
                COUNT(rm.material_id) as total_materials,
                SUM(rm.quantity) as total_quantity
            FROM recycled_materials rm
            JOIN recycling_centers rc ON rm.center_id = rc.center_id
            WHERE DATE(rm.date_received) BETWEEN ? AND ?
            GROUP BY rm.center_id
            ORDER BY total_quantity DESC`,
            [startDate, endDate]
        );
        
        res.json({
            report_type: 'monthly',
            month: `${reportYear}-${String(reportMonth).padStart(2, '0')}`,
            summary: {
                total_requests: summary[0]?.total_requests || 0,
                pending: summary[0]?.pending || 0,
                approved: summary[0]?.approved || 0,
                completed: summary[0]?.completed || 0,
                cancelled: summary[0]?.cancelled || 0
            },
            weekly_breakdown: weeklyBreakdown,
            waste_types: wasteTypes,
            top_locations: locations,
            collector_performance: collectors,
            center_performance: centers,
            generated_at: new Date().toISOString()
        });
        
    } catch (err) {
        console.error('Error generating monthly report:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 10.4 YEARLY REPORT
// ==========================================
app.get('/api/reports/yearly', async (req, res) => {
    const { year } = req.query;
    
    try {
        const currentDate = new Date();
        const reportYear = parseInt(year) || currentDate.getFullYear();
        
        const startDate = `${reportYear}-01-01`;
        const endDate = `${reportYear}-12-31`;
        
        // Yearly summary
        const [summary] = await db.execute(
            `SELECT 
                COUNT(*) as total_requests,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
            FROM waste_requests 
            WHERE DATE(request_date) BETWEEN ? AND ?`,
            [startDate, endDate]
        );
        
        // Monthly breakdown
        const [monthlyBreakdown] = await db.execute(
            `SELECT 
                MONTH(request_date) as month,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
            FROM waste_requests 
            WHERE DATE(request_date) BETWEEN ? AND ?
            GROUP BY MONTH(request_date)
            ORDER BY month`,
            [startDate, endDate]
        );
        
        // Waste type distribution
        const [wasteTypes] = await db.execute(
            `SELECT waste_type, COUNT(*) as count 
            FROM waste_requests 
            WHERE DATE(request_date) BETWEEN ? AND ?
            GROUP BY waste_type
            ORDER BY count DESC`,
            [startDate, endDate]
        );
        
        // Monthly collection trends
        const [collectionTrends] = await db.execute(
            `SELECT 
                MONTH(collection_date) as month,
                COUNT(*) as collections
            FROM collection_schedules 
            WHERE DATE(collection_date) BETWEEN ? AND ?
            GROUP BY MONTH(collection_date)
            ORDER BY month`,
            [startDate, endDate]
        );
        
        // Top performing centers
        const [topCenters] = await db.execute(
            `SELECT 
                rc.center_name,
                COUNT(rm.material_id) as materials_processed,
                SUM(rm.quantity) as total_quantity
            FROM recycled_materials rm
            JOIN recycling_centers rc ON rm.center_id = rc.center_id
            WHERE DATE(rm.date_received) BETWEEN ? AND ?
            GROUP BY rm.center_id
            ORDER BY total_quantity DESC
            LIMIT 5`,
            [startDate, endDate]
        );
        
        // User growth
        const [userGrowth] = await db.execute(
            `SELECT 
                MONTH(created_at) as month,
                COUNT(*) as new_users
            FROM users 
            WHERE DATE(created_at) BETWEEN ? AND ?
            GROUP BY MONTH(created_at)
            ORDER BY month`,
            [startDate, endDate]
        );
        
        // Completion rate by month
        const [completionRate] = await db.execute(
            `SELECT 
                MONTH(request_date) as month,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
                ROUND((SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as completion_rate
            FROM waste_requests 
            WHERE DATE(request_date) BETWEEN ? AND ?
            GROUP BY MONTH(request_date)
            ORDER BY month`,
            [startDate, endDate]
        );
        
        res.json({
            report_type: 'yearly',
            year: reportYear,
            summary: {
                total_requests: summary[0]?.total_requests || 0,
                pending: summary[0]?.pending || 0,
                approved: summary[0]?.approved || 0,
                completed: summary[0]?.completed || 0,
                cancelled: summary[0]?.cancelled || 0,
                total_collections: collectionTrends.reduce((sum, item) => sum + item.collections, 0)
            },
            monthly_breakdown: monthlyBreakdown,
            waste_types: wasteTypes,
            collection_trends: collectionTrends,
            top_centers: topCenters,
            user_growth: userGrowth,
            completion_rate: completionRate,
            generated_at: new Date().toISOString()
        });
        
    } catch (err) {
        console.error('Error generating yearly report:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 10.5 CUSTOM DATE RANGE REPORT
// ==========================================
app.get('/api/reports/custom', async (req, res) => {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
        return res.status(400).json({ error: 'start_date and end_date are required' });
    }
    
    try {
        // Summary
        const [summary] = await db.execute(
            `SELECT 
                COUNT(*) as total_requests,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
            FROM waste_requests 
            WHERE DATE(request_date) BETWEEN ? AND ?`,
            [start_date, end_date]
        );
        
        // Full data export
        const [requests] = await db.execute(
            `SELECT 
                wr.*,
                u.fullname as resident_name,
                u.email as resident_email,
                rc.center_name as assigned_center
            FROM waste_requests wr
            LEFT JOIN residents r ON wr.resident_id = r.resident_id
            LEFT JOIN users u ON r.user_id = u.user_id
            LEFT JOIN collection_schedules cs ON wr.request_id = cs.request_id
            LEFT JOIN recycling_centers rc ON cs.collector_id = rc.center_id
            WHERE DATE(wr.request_date) BETWEEN ? AND ?
            ORDER BY wr.request_date DESC`,
            [start_date, end_date]
        );
        
        res.json({
            report_type: 'custom',
            start_date: start_date,
            end_date: end_date,
            summary: {
                total_requests: summary[0]?.total_requests || 0,
                pending: summary[0]?.pending || 0,
                approved: summary[0]?.approved || 0,
                completed: summary[0]?.completed || 0,
                cancelled: summary[0]?.cancelled || 0
            },
            requests: requests,
            generated_at: new Date().toISOString()
        });
        
    } catch (err) {
        console.error('Error generating custom report:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 10.6 DASHBOARD SUMMARY (Real-time)
// ==========================================
app.get('/api/reports/dashboard', async (req, res) => {
    try {
        // Today's stats
        const today = new Date().toISOString().split('T')[0];
        
        const [todaySummary] = await db.execute(
            `SELECT 
                COUNT(*) as today_requests,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as today_pending
            FROM waste_requests 
            WHERE DATE(request_date) = ?`,
            [today]
        );
        
        // Overall stats
        const [overall] = await db.execute(
            `SELECT 
                COUNT(*) as total_requests,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as total_pending,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as total_completed
            FROM waste_requests`
        );
        
        // Recent activity (last 10 requests)
        const [recent] = await db.execute(
            `SELECT 
                wr.*,
                u.fullname as resident_name
            FROM waste_requests wr
            LEFT JOIN residents r ON wr.resident_id = r.resident_id
            LEFT JOIN users u ON r.user_id = u.user_id
            ORDER BY wr.request_date DESC
            LIMIT 10`
        );
        
        // Collector availability
        const [collectors] = await db.execute(
            `SELECT 
                COUNT(*) as total_collectors,
                SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available_collectors
            FROM collectors`
        );
        
        res.json({
            today: {
                requests: todaySummary[0]?.today_requests || 0,
                pending: todaySummary[0]?.today_pending || 0
            },
            overall: {
                total_requests: overall[0]?.total_requests || 0,
                pending: overall[0]?.total_pending || 0,
                completed: overall[0]?.total_completed || 0
            },
            collectors: {
                total: collectors[0]?.total_collectors || 0,
                available: collectors[0]?.available_collectors || 0
            },
            recent_activity: recent,
            generated_at: new Date().toISOString()
        });
        
    } catch (err) {
        console.error('Error generating dashboard summary:', err);
        res.status(500).json({ error: err.message });
    }
});
// --- SERVER INITIALIZATION ---
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});