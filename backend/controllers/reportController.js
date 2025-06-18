const { sendMonthlyReport } = require('../services/emailService');
const pool = require('../config/db');
const cron = require('node-cron');

/**
 * Generate and send monthly report
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateMonthlyReport = async (req, res) => {
    try {
        const { month, year } = req.body;
        
        // Validate month and year
        if (!month || !year) {
            return res.status(400).json({ error: 'Month and year are required' });
        }

        // Query to get transactions with category and funding source information
        const query = `
            SELECT 
                t.*,
                c.name as category_name,
                fs.name as funding_source_name
            FROM transactions t
            LEFT JOIN categories c ON t.category_id = c.id
            LEFT JOIN funding_sources fs ON t.funding_source_id = fs.id
            WHERE EXTRACT(MONTH FROM t.transaction_date) = $1 
            AND EXTRACT(YEAR FROM t.transaction_date) = $2
            ORDER BY t.transaction_date DESC
        `;
        
        const result = await pool.query(query, [month, year]);
        const transactions = result.rows;

        if (transactions.length === 0) {
            return res.status(404).json({ 
                message: `No transactions found for ${month}/${year}`,
                transactionCount: 0
            });
        }

        // Send email with the report
        await sendMonthlyReport(transactions, month, year);

        res.json({ 
            message: 'Monthly report generated and sent successfully',
            transactionCount: transactions.length
        });
    } catch (error) {
        console.error('Error generating monthly report:', error);
        res.status(500).json({ error: 'Failed to generate monthly report' });
    }
};

/**
 * Schedule monthly transaction report
 * This will run at 9:00 AM on the 1st day of each month
 */
const scheduleMonthlyReport = () => {
    // Run at 9:00 AM on the 1st day of each month
    cron.schedule('0 9 1 * *', async () => {
        try {
            const now = new Date();
            const month = now.getMonth() + 1; // JavaScript months are 0-based
            const year = now.getFullYear();

            const query = `
                SELECT 
                    t.*,
                    c.name as category_name,
                    fs.name as funding_source_name
                FROM transactions t
                LEFT JOIN categories c ON t.category_id = c.id
                LEFT JOIN funding_sources fs ON t.funding_source_id = fs.id
                WHERE EXTRACT(MONTH FROM t.transaction_date) = $1 
                AND EXTRACT(YEAR FROM t.transaction_date) = $2
                ORDER BY t.transaction_date DESC
            `;
            
            const result = await pool.query(query, [month, year]);
            const transactions = result.rows;

            if (transactions.length > 0) {
                // Send email with the report
                await sendMonthlyReport(transactions, month, year);
                console.log(`Monthly transaction report for ${month}/${year} sent successfully with ${transactions.length} transactions`);
            } else {
                console.log(`No transactions found for ${month}/${year} - no report sent`);
            }
        } catch (error) {
            console.error('Error in scheduled transaction report:', error);
        }
    });
    console.log('Transaction report scheduler set for 9:00 AM on the 1st day of each month');
};

module.exports = {
    generateMonthlyReport,
    scheduleMonthlyReport
}; 