const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
// Add this after your middleware setup and before other routes

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'OK', 
      message: 'Server is running',
      timestamp: new Date().toISOString()
    });
  });
  
  // Root path redirect to help with navigation
  app.get('/', (req, res) => {
    res.send(`
      <h1>Collabridge Forms Server</h1>
      <p>Server is running successfully!</p>
      <ul>
        <li><a href="/health">Check server health</a></li>
        <li><a href="/RequestDemo.html">Request Demo Form</a></li>
        <li><a href="/contact.html">Contact Form</a></li>
      </ul>
    `);
  });

// Serve static files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// Configure email transport based on service
let transportConfig;
switch (process.env.EMAIL_SERVICE?.toLowerCase()) {
  case 'outlook':
  case 'hotmail':
  case 'live':
    transportConfig = {
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        ciphers: 'SSLv3'
      }
    };
    break;
  case 'office365':
    transportConfig = {
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        ciphers: 'SSLv3'
      }
    };
    break;
  case 'gmail':
  default:
    transportConfig = {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    };
}

const transporter = nodemailer.createTransport(transportConfig);

// Contact form endpoint
app.post('/collabridge-forms/api/contact', async (req, res) => {
    try {
    const { firstName, lastName, email, phone, company, subject, message } = req.body;
    
    // Email to admin
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || 'info@collabridge.com',
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>New contact form submission</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong> ${message}</p>
      `
    };
    
    // Email to user
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Thank you for contacting Collabridge Solutions',
      html: `
        <h2>Thank you for reaching out to Collabridge Solutions</h2>
        <p>Dear ${firstName},</p>
        <p>We have received your message and will get back to you shortly.</p>
        <p>Here's a copy of your message:</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong> ${message}</p>
        <br>
        <p>Best Regards,</p>
        <p>The Collabridge Solutions Team</p>
      `
    };
    
    // Send emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);
    
    res.status(200).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Error sending message' });
  }
});

// Update your demo-request endpoint for better error handling:

app.post('/collabridge-forms/api/demo-request', async (req, res) => {
  try {
    console.log('Demo request received:', req.body);
    
    const { 
      firstName, lastName, email, phone, requirements,
      demoDate, timeSlot, timezone,
      selectedServices, selectedTechnologies, selectedIndustries 
    } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Format services, technologies, and industries
    const services = Array.isArray(selectedServices) ? selectedServices.join(', ') : selectedServices || 'None selected';
    const technologies = Array.isArray(selectedTechnologies) ? selectedTechnologies.join(', ') : selectedTechnologies || 'None selected';
    const industries = Array.isArray(selectedIndustries) ? selectedIndustries.join(', ') : selectedIndustries || 'None selected';
    
    try {
      // Email to admin
      const adminMailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL || 'info@collabridge.com',
        subject: `New Demo Request from ${firstName} ${lastName}`,
        html: `
          <h2>New Demo Request</h2>
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <h3>Requested Demo Details:</h3>
          <p><strong>Date:</strong> ${demoDate}</p>
          <p><strong>Time:</strong> ${timeSlot} (${timezone})</p>
          <p><strong>Selected Services:</strong> ${services}</p>
          <p><strong>Selected Technologies:</strong> ${technologies}</p>
          <p><strong>Selected Industries:</strong> ${industries}</p>
          <p><strong>Additional Requirements:</strong> ${requirements || 'None provided'}</p>
        `
      };
      
      console.log('Sending admin email to:', adminMailOptions.to);
      await transporter.sendMail(adminMailOptions);
      console.log('Admin email sent');
      
      // Email to user
      const userMailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Demo Request Confirmation - Collabridge Solutions',
        html: `
          <h2>Your Demo Request is Confirmed</h2>
          <p>Dear ${firstName},</p>
          <p>Thank you for scheduling a demo with Collabridge Solutions. We have received your request for the following:</p>
          <p><strong>Date:</strong> ${demoDate}</p>
          <p><strong>Time:</strong> ${timeSlot} (${timezone})</p>
          <p><strong>Selected Services:</strong> ${services}</p>
          <p><strong>Selected Technologies:</strong> ${technologies}</p>
          <p><strong>Selected Industries:</strong> ${industries}</p>
          <p>One of our experts will be in touch with you shortly to confirm the details of your demo session.</p>
          <p>If you need to reschedule or have any questions, please reply to this email or contact us at ${process.env.ADMIN_EMAIL || 'info@collabridge.com'}.</p>
          <br>
          <p>Best Regards,</p>
          <p>The Collabridge Solutions Team</p>
        `
      };
      
      console.log('Sending confirmation email to:', userMailOptions.to);
      await transporter.sendMail(userMailOptions);
      console.log('User confirmation email sent');
      
      res.status(200).json({ success: true, message: 'Demo request submitted successfully' });
    } catch (emailError) {
      console.error('Email error details:', emailError);
      res.status(500).json({ success: false, message: 'Error sending confirmation email' });
    }
  } catch (error) {
    console.error('General error in demo request processing:', error);
    res.status(500).json({ success: false, message: 'Server error processing your request' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});