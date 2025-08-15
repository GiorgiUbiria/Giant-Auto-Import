import { payments, cars, users } from "@/lib/drizzle/schema";
import { InferSelectModel } from "drizzle-orm";

type Payment = InferSelectModel<typeof payments>;
type Car = InferSelectModel<typeof cars>;
type User = InferSelectModel<typeof users>;

export interface InvoiceData {
    payment: Payment;
    customer: {
        id: string;
        fullName: string;
        email: string;
        phone?: string;
    };
    cars?: {
        id: number;
        vin: string;
        year: number;
        make: string;
        model: string;
    }[];
    invoiceType: "SHIPPING" | "PURCHASE" | "TOTAL";
}

export interface InvoiceTemplate {
    companyName: string;
    companyAddress: string;
    companyPhone: string;
    companyEmail: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    customerName: string;
    customerAddress: string;
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    total: number;
    notes: string;
}

export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
}

export class InvoiceGenerator {
    private static formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    }

    private static formatDate(date: Date): string {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    static generateInvoiceData(data: InvoiceData): InvoiceTemplate {
        const { payment, customer, cars, invoiceType } = data;

        const invoiceDate = new Date();
        const dueDate = new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

        const items: InvoiceItem[] = [];

        // Generate items based on invoice type
        switch (invoiceType) {
            case "PURCHASE":
                items.push({
                    description: "Vehicle Purchase Fee",
                    quantity: 1,
                    unitPrice: payment.amount,
                    amount: payment.amount,
                });
                break;

            case "SHIPPING":
                items.push({
                    description: "Shipping and Handling",
                    quantity: 1,
                    unitPrice: payment.amount,
                    amount: payment.amount,
                });
                break;

            case "TOTAL":
                items.push({
                    description: "Total Vehicle Services",
                    quantity: 1,
                    unitPrice: payment.amount,
                    amount: payment.amount,
                });
                break;
        }

        return {
            companyName: "Giant Auto Import",
            companyAddress: "123 Business Street, Tbilisi, Georgia",
            companyPhone: "+995 123 456 789",
            companyEmail: "info@giantautoimport.com",
            invoiceNumber: `INV-${payment.id.toString().padStart(6, '0')}`,
            invoiceDate: this.formatDate(invoiceDate),
            dueDate: this.formatDate(dueDate),
            customerName: customer.fullName,
            customerAddress: `${customer.email}`,
            items,
            subtotal: payment.amount,
            tax: 0, // No tax for now
            total: payment.amount,
            notes: payment.note || "Thank you for your business!",
        };
    }

    static generateInvoiceHTML(template: InvoiceTemplate): string {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${template.invoiceNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .company-info {
            flex: 1;
          }
          .invoice-info {
            flex: 1;
            text-align: right;
          }
          .customer-info {
            margin-bottom: 30px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f8f9fa;
            font-weight: bold;
          }
          .total-row {
            font-weight: bold;
            background-color: #f8f9fa;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <h1>${template.companyName}</h1>
            <p>${template.companyAddress}</p>
            <p>Phone: ${template.companyPhone}</p>
            <p>Email: ${template.companyEmail}</p>
          </div>
          <div class="invoice-info">
            <h2>INVOICE</h2>
            <p><strong>Invoice #:</strong> ${template.invoiceNumber}</p>
            <p><strong>Date:</strong> ${template.invoiceDate}</p>
            <p><strong>Due Date:</strong> ${template.dueDate}</p>
          </div>
        </div>
        
        <div class="customer-info">
          <h3>Bill To:</h3>
          <p><strong>${template.customerName}</strong></p>
          <p>${template.customerAddress}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${template.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>${this.formatCurrency(item.unitPrice)}</td>
                <td>${this.formatCurrency(item.amount)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="text-align: right;"><strong>Subtotal:</strong></td>
              <td>${this.formatCurrency(template.subtotal)}</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align: right;"><strong>Tax:</strong></td>
              <td>${this.formatCurrency(template.tax)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3" style="text-align: right;"><strong>Total:</strong></td>
              <td><strong>${this.formatCurrency(template.total)}</strong></td>
            </tr>
          </tfoot>
        </table>
        
        <div class="footer">
          <p><strong>Notes:</strong> ${template.notes}</p>
          <p>Payment is due within 30 days of invoice date.</p>
        </div>
      </body>
      </html>
    `;
    }

    static async generatePDF(template: InvoiceTemplate): Promise<Buffer> {
        // This is a placeholder for PDF generation
        // In a real implementation, you would use a library like puppeteer or jsPDF
        const html = this.generateInvoiceHTML(template);

        // For now, return a simple text representation
        const text = `
INVOICE ${template.invoiceNumber}
Date: ${template.invoiceDate}
Due Date: ${template.dueDate}

Bill To:
${template.customerName}
${template.customerAddress}

Items:
${template.items.map(item => `${item.description} - ${this.formatCurrency(item.amount)}`).join('\n')}

Total: ${this.formatCurrency(template.total)}

Notes: ${template.notes}
    `;

        return Buffer.from(text, 'utf-8');
    }
}
