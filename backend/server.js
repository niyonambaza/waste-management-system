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

// Login User
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        req.session.user = { id: user.user_id, fullname: user.fullname, role: user.role };
        res.json({ message: 'Login successful', user: req.session.user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Logout User
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'Could not log out' });
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
    });
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
// ==========================================
// 7. CRUD: WASTE REQUESTS (KOSORA HANO)
// ==========================================
// 7. CRUD: WASTE REQUESTS - KOSORA HANO BURUNDU
app.post('/api/waste-requests', async (req, res) => {
    const { resident_id, waste_type, description, image, location, status } = req.body;
    
    try {
        const userId = parseInt(resident_id, 10);

        // 1. Gushaka resident_id muri table ya residents
        let [residentRows] = await db.execute(
            'SELECT resident_id FROM residents WHERE user_id = ?', 
            [userId]
        );

        let actualResidentId;

        // 2. NIBA UWO MUNTU NTAYO AFITE, MUHAMRE PROFILE AKO KANYA!
        if (residentRows.length === 0) {
            const [newResident] = await db.execute(
                'INSERT INTO residents (user_id, address) VALUES (?, ?)',
                [userId, location || 'Kigali, Rwanda'] // Ifata ya location ya request nka address ye
            );
            actualResidentId = newResident.insertId;
        } else {
            actualResidentId = residentRows[0].resident_id;
        }

        // 3. Kwandika muri waste_requests nta nkomyi
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
// 10. CRUD: RECYCLED MATERIALS
// ==========================================
app.post('/api/recycled-materials', async (req, res) => {
    const { center_id, request_id, material_type, quantity, date_received } = req.body;
    try {
        const [r] = await db.execute(
            'INSERT INTO recycled_materials (center_id, request_id, material_type, quantity, date_received) VALUES (?,?,?,?,?)',
            [center_id, request_id, material_type, quantity, date_received]
        );
        res.status(201).json({ material_id: r.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/recycled-materials', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM recycled_materials');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/recycled-materials/:id', async (req, res) => {
    const { center_id, request_id, material_type, quantity, date_received } = req.body;
    try {
        await db.execute(
            'UPDATE recycled_materials SET center_id=?, request_id=?, material_type=?, quantity=?, date_received=? WHERE material_id=?',
            [center_id, request_id, material_type, quantity, date_received, req.params.id]
        );
        res.json({ message: 'Inventory update recorded' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/recycled-materials/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM recycled_materials WHERE material_id=?', [req.params.id]);
        res.json({ message: 'Entry removed' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// ==========================================
// 1. KOHEREZA NOTIFICATION (ADMIN BROADCAST CYANGWA INDIVIDUAL)
// 1. KOHEREZA UBUTUMWA (POST /api/notifications)
app.post('/api/notifications', (req, res) => {
    // 💡 UMUTI: Niba database yawe yanga NULL, duha user_id numero ya 0 nk'amahitamo ya kabiri
    const userId = req.body.user_id ? parseInt(req.body.user_id, 10) : 0; 
    const title = req.body.title || '';
    const message = req.body.message || '';
    const status = req.body.status || 'active';
    const targetRole = req.body.target_role ? req.body.target_role.toLowerCase() : 'all';
    const isRead = 0;

    const query = 'INSERT INTO notifications (user_id, title, message, status, created_at, target_role, is_read) VALUES (?, ?, ?, ?, NOW(), ?, ?)';

    // Gukoresha callback isanzwe (No promises)
    db.query(query, [userId, title, message, status, targetRole, isRead], (err, result) => {
        if (err) {
            console.error('❌ SQL Error:', err);
            // 💡 ICYITONDERWA: Iyi return ni yo ituma frontend imenya ko byanze, ikarekura loading!
            return res.status(500).json({ 
                error: 'Database rejected notification entry', 
                details: err.message 
            });
        }
        
        // 💡 ICYITONDERWA: Iyi return ni yo ibwira frontend ko byagenze neza!
        return res.status(201).json({ 
            message: 'Notification sent successfully!', 
            notification_id: result.insertId 
        });
    });
});
// 2. GUKURURA NOTIFICATIONS Z'UMUNTU WINJIYE (BY USER_ID AND ROLE)
app.get('/api/my-notifications', (req, res) => {
    const userId = parseInt(req.query.user_id, 10);
    const userRole = req.query.role ? req.query.role.toLowerCase() : '';

    // Query ifata izandikiwe uwo muntu CYANGWA iz'itsinda rye CYANGWA iz'abantu bose ('all')
    const query = 'SELECT * FROM notifications WHERE user_id = ? OR target_role = ? OR target_role = "all" ORDER BY created_at DESC';

    db.query(query, [userId, userRole], (err, rows) => {
        if (err) {
            console.error('❌ SQL Error:', err);
            return res.status(500).json({ error: 'Failed to fetch notifications' });
        }
        return res.status(200).json(rows);
    });
});

app.put('/api/notifications/:id', async (req, res) => {
    const { title, message, status } = req.body;
    try {
        await db.execute(
            'UPDATE notifications SET title=?, message=?, status=? WHERE notification_id=?',
            [title, message, status, req.params.id]
        );
        res.json({ message: 'Notification changed' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. GUSIBA NOTIFICATION (DELETE)
app.delete('/api/notifications/:id', (req, res) => {
    const notificationId = req.params.id;

    const query = 'DELETE FROM notifications WHERE notification_id = ?';

    db.query(query, [notificationId], (err, result) => {
        if (err) {
            console.error('❌ SQL Error:', err);
            return res.status(500).json({ error: 'Failed to delete notification' });
        }
        return res.status(200).json({ message: 'Notification dropped from registers.' });
    });
});


// --- SERVER INITIALIZATION ---
app.listen(PORT, () => {
    console.log(`server is running  on port ${PORT}`);
});