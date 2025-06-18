const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "darg0205@gmail.com",
        pass: "nust rsps vvee znwl"
    }
});

/**
 * Formats a date to dd/mm/yyyy
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

/**
 * Creates CSV content from investment transactions
 * @param {Array} transactions - Array of investment transaction objects
 * @returns {string} CSV content
 */
const createCSVContent = (transactions) => {
    const headers = ['Date', 'Ticker', 'Amount Invested', 'Price per Unit', 'Tax'];
    const rows = transactions.map(t => [
        formatDate(t.transaction_date),
        t.ticker,
        t.amount_invested,
        t.price_per_unit,
        t.tax || '0'
    ]);
    
    return [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
};

/**
 * Sends a monthly investment report email
 * @param {Array} transactions - Array of investment transaction objects
 * @param {string} month - Month of the report
 * @param {string} year - Year of the report
 */
const sendMonthlyInvestmentReport = async (transactions, month, year) => {
    try {
        // Calculate total investment and tax
        const totalInvestment = transactions.reduce((sum, t) => sum + parseFloat(t.amount_invested), 0);
        const totalTax = transactions.reduce((sum, t) => sum + parseFloat(t.tax || 0), 0);

        // Create HTML content for the email
        const htmlContent = `
            <h2>Monthly Investment Report - ${month} ${year}</h2>
            <h3>Summary</h3>
            <p>Total Amount Invested: $${totalInvestment.toFixed(2)}</p>
            <p>Total Tax Paid: $${totalTax.toFixed(2)}</p>
            
            <h3>Investment Details</h3>
            <table border="1" style="border-collapse: collapse; width: 100%;">
                <tr>
                    <th>Date</th>
                    <th>Ticker</th>
                    <th>Amount Invested</th>
                    <th>Price per Unit</th>
                    <th>Tax</th>
                </tr>
                ${transactions.map(t => `
                    <tr>
                        <td>${formatDate(t.transaction_date)}</td>
                        <td>${t.ticker}</td>
                        <td>$${parseFloat(t.amount_invested).toFixed(2)}</td>
                        <td>$${parseFloat(t.price_per_unit).toFixed(2)}</td>
                        <td>$${parseFloat(t.tax || 0).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </table>
        `;

        // Create CSV content
        const csvContent = createCSVContent(transactions);

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'darg0205@gmail.com',
            subject: `Monthly Investment Report - ${month} ${year}`,
            html: htmlContent,
            attachments: [{
                filename: `investment_transactions_${month}_${year}.csv`,
                content: csvContent
            }]
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Investment report email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending investment report email:', error);
        throw error;
    }
};

module.exports = {
    sendMonthlyInvestmentReport
}; 