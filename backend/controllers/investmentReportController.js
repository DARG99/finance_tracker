const { sendMonthlyInvestmentReport } = require('../services/investmentEmailService');
const { sendMonthlyReport } = require('../services/emailService');
const pool = require('../config/db');
const cron = require('node-cron');

/**
 * Generate and send monthly investment report
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateMonthlyInvestmentReport = async (req, res) => {
    try {
        const { month, year } = req.body;
        
        // Validate month and year
        if (!month || !year) {
            return res.status(400).json({ error: 'Month and year are required' });
        }

        // Query to get investment transactions for the specified month and year
        const query = `
            SELECT 
                it.*,
                i.ticker
            FROM investments_transactions it
            JOIN investments i ON it.investments_id = i.id
            WHERE EXTRACT(MONTH FROM it.date) = $1 
            AND EXTRACT(YEAR FROM it.date) = $2
            ORDER BY it.date DESC
        `;
        
        const result = await pool.query(query, [month, year]);
        const transactions = result.rows;

        if (transactions.length === 0) {
            return res.status(404).json({ 
                message: `No investment transactions found for ${month}/${year}`,
                transactionCount: 0
            });
        }

        // Send email with the report
        await sendMonthlyInvestmentReport(transactions, month, year);

        res.json({ 
            message: 'Monthly investment report generated and sent successfully',
            transactionCount: transactions.length
        });
    } catch (error) {
        console.error('Error generating monthly investment report:', error);
        res.status(500).json({ error: 'Failed to generate monthly investment report' });
    }
};

/**
 * Schedule monthly reports
 * This will run at 9:00 AM on the 1st day of each month
 */
const scheduleMonthlyReports = () => {
    // Run at 9:00 AM on the 1st day of each month
    cron.schedule('0 9 1 * *', async () => {
        try {
            const now = new Date();
            const month = now.getMonth() + 1; // JavaScript months are 0-based
            const year = now.getFullYear();

            // Get investment transactions
            const investmentQuery = `
                SELECT 
                    it.*,
                    i.ticker
                FROM investments_transactions it
                JOIN investments i ON it.investments_id = i.id
                WHERE EXTRACT(MONTH FROM it.date) = $1 
                AND EXTRACT(YEAR FROM it.date) = $2
                ORDER BY it.date DESC
            `;
            
            const investmentResult = await pool.query(investmentQuery, [month, year]);
            const investmentTransactions = investmentResult.rows;

            // Get regular transactions
            const transactionQuery = `
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
            
            const transactionResult = await pool.query(transactionQuery, [month, year]);
            const regularTransactions = transactionResult.rows;

            // Only send reports if there are transactions
            const reportPromises = [];
            
            if (investmentTransactions.length > 0) {
                reportPromises.push(sendMonthlyInvestmentReport(investmentTransactions, month, year));
                console.log(`Sending investment report for ${month}/${year} with ${investmentTransactions.length} transactions`);
            } else {
                console.log(`No investment transactions found for ${month}/${year}`);
            }

            if (regularTransactions.length > 0) {
                reportPromises.push(sendMonthlyReport(regularTransactions, month, year));
                console.log(`Sending regular transactions report for ${month}/${year} with ${regularTransactions.length} transactions`);
            } else {
                console.log(`No regular transactions found for ${month}/${year}`);
            }

            // Only wait for promises if there are any reports to send
            if (reportPromises.length > 0) {
                await Promise.all(reportPromises);
                console.log(`Monthly reports for ${month}/${year} sent successfully`);
            } else {
                console.log(`No reports sent for ${month}/${year} - no transactions found`);
            }
        } catch (error) {
            console.error('Error in scheduled reports:', error);
        }
    });
    console.log('Investment report scheduler set for 9:00 AM on the 1st day of each month');
};

module.exports = {
    generateMonthlyInvestmentReport,
    scheduleMonthlyReports
}; 