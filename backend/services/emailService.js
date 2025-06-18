const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "darg0205@gmail.com", // Your Gmail address
        pass: "nust rsps vvee znwl"// Your Gmail app password
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
 * Creates CSV content from transactions
 * @param {Array} transactions - Array of transaction objects
 * @returns {string} CSV content
 */
const createCSVContent = (transactions) => {
    const headers = ['Date', 'Amount', 'Type', 'Category', 'Description', 'Funding Source'];
    const rows = transactions.map(t => [
        formatDate(t.transaction_date),
        t.amount,
        t.type,
        t.category_name || '',
        t.description || '',
        t.funding_source_name || ''
    ]);
    
    return [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
};

/**
 * Sends a monthly transaction report email
 * @param {Array} transactions - Array of transaction objects
 * @param {string} month - Month of the report
 * @param {string} year - Year of the report
 */
const sendMonthlyReport = async (transactions, month, year) => {
    try {
        // Calculate total income and expenses
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        // Create HTML content for the email
        const htmlContent = `
            <h2>Monthly Financial Report - ${month} ${year}</h2>
            <h3>Summary</h3>
            <p>Total Income: $${totalIncome.toFixed(2)}</p>
            <p>Total Expenses: $${totalExpenses.toFixed(2)}</p>
            <p>Net Balance: $${(totalIncome - totalExpenses).toFixed(2)}</p>
            
            <h3>Transaction Details</h3>
            <table border="1" style="border-collapse: collapse; width: 100%;">
                <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Amount</th>
                </tr>
                ${transactions.map(t => `
                    <tr>
                        <td>${formatDate(t.transaction_date)}</td>
                        <td>${t.description || ''}</td>
                        <td>${t.type}</td>
                        <td>$${parseFloat(t.amount).toFixed(2)}</td>
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
            subject: `Monthly Financial Report - ${month} ${year}`,
            html: htmlContent,
            attachments: [{
                filename: `transactions_${month}_${year}.csv`,
                content: csvContent
            }]
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = {
    sendMonthlyReport
}; 