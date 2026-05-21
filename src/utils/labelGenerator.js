import { jsPDF } from 'jspdf';
import bwipjs from 'bwip-js';

/**
 * Generates a base64 barcode image from the given tracking ID using bwip-js.
 * @param {string} text - The tracking ID.
 * @returns {Promise<string>} - A promise that resolves to the barcode's base64 data URL.
 */
export const generateBarcode = (text) => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      bwipjs.toCanvas(canvas, {
        bcid: 'code128',       // Barcode type
        text: text,            // Text to encode
        scale: 3,              // 3x scaling factor for sharp resolution
        height: 12,            // Bar height in mm
        includetext: false,    // We will render human-readable text separately
      });
      resolve(canvas.toDataURL('image/png'));
    } catch (err) {
      console.error('Barcode generation error:', err);
      reject(err);
    }
  });
};

/**
 * Generates and downloads a professional shipping label PDF for an order.
 * @param {object} order - The order object from the backend.
 */
export const downloadShippingLabel = async (order) => {
  if (!order) {
    console.error('No order provided to label generator.');
    return;
  }

  // Fallbacks for missing tracking/courier info
  const trackingId = order.trackingId || `OD${order._id.slice(-9).toUpperCase()}`;
  const courierName = (order.courierName || 'OdishaShop Express').toUpperCase();
  const paymentMethod = order.paymentMethod || 'cod';
  const isPaid = order.isPaid || false;
  const isCod = paymentMethod === 'cod' && !isPaid;

  try {
    // Generate barcode first
    const barcodeImage = await generateBarcode(trackingId);

    // Create 4" x 6" standard label size PDF (101.6mm x 152.4mm)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [100, 150], // Standard 100mm x 150mm shipping label
    });

    // 1. Draw outer sticker border
    doc.setDrawColor(0);
    doc.setLineWidth(0.4);
    doc.rect(3, 3, 94, 144); // 3mm margin on all sides

    // 2. Header Section
    // Left Branding
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('ODISHASHOP', 6, 10);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(80);
    doc.text('www.odisha.shop', 6, 13);

    // Right Courier Info
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0);
    doc.text(courierName, 94, 10, { align: 'right' });
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100);
    doc.text('STANDARD DELIVERY', 94, 13, { align: 'right' });

    // Header Divider
    doc.setLineWidth(0.2);
    doc.setDrawColor(120);
    doc.line(3, 16, 97, 16);

    // 3. Barcode Section
    if (barcodeImage) {
      doc.addImage(barcodeImage, 'PNG', 12, 19, 76, 16);
    }
    
    // Tracking ID Label
    doc.setFont('Courier', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0);
    doc.text(trackingId, 50, 39, { align: 'center' });

    // Barcode Section Divider
    doc.setLineWidth(0.2);
    doc.line(3, 42, 97, 42);

    // 4. Order Meta Section
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(80);
    doc.text('ORDER ID:', 6, 47);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(0);
    doc.text(`#${order._id.toUpperCase()}`, 21, 47);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(80);
    doc.text('ORDER DATE:', 6, 52);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(0);
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    doc.text(orderDate, 24, 52);

    // COD / PREPAID box
    doc.setLineWidth(0.4);
    doc.rect(62, 44, 32, 11); // Box on the right

    if (isCod) {
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('COD', 78, 48.5, { align: 'center' });
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text(`Collect: Rs ${order.totalPrice}`, 78, 52.5, { align: 'center' });
    } else {
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('PREPAID', 78, 49, { align: 'center' });
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('Paid Online', 78, 52.5, { align: 'center' });
    }

    // Order Meta Divider
    doc.setLineWidth(0.2);
    doc.line(3, 58, 97, 58);

    // 5. Shipping Address Section
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0);
    doc.text('SHIP TO / DELIVER TO:', 6, 63);

    // Customer Name
    const customerName = (order.shippingAddress?.name || order.user?.name || 'Customer').toUpperCase();
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(customerName, 6, 68.5);

    // Full Address Wrapping
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(50);
    
    const addressLine1 = order.shippingAddress?.line1 || '';
    const cityStatePincode = `${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}`;
    const fullAddressText = `${addressLine1}, ${cityStatePincode}`;
    
    // Split address automatically into lines that fit the width (88mm)
    const addressLines = doc.splitTextToSize(fullAddressText, 88);
    
    let currentY = 73.5;
    addressLines.forEach(line => {
      doc.text(line, 6, currentY);
      currentY += 4.2;
    });

    // Customer Phone
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0);
    doc.text(`PHONE: ${order.shippingAddress?.phone || 'N/A'}`, 6, currentY + 1.5);
    
    currentY += 6.5;

    // Address Divider
    doc.setLineWidth(0.2);
    doc.line(3, currentY, 97, currentY);
    currentY += 4.5;

    // 6. Products Table / List
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('PRODUCT DETAILS', 6, currentY);
    doc.text('QTY', 76, currentY, { align: 'center' });
    doc.text('WEIGHT', 90, currentY, { align: 'center' });
    
    currentY += 4;
    doc.setLineWidth(0.1);
    doc.line(5, currentY, 95, currentY);
    currentY += 4.5;

    // List ordered products
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(50);

    order.items.forEach(item => {
      // Check if currentY is getting dangerously close to the bottom
      if (currentY > 132) return; // Cap listing to avoid overflow

      const nameText = item.name || 'Product';
      const weightText = item.weight || '1kg';
      const qtyText = String(item.qty || 1);

      // Split name to avoid line overflow
      const nameLines = doc.splitTextToSize(nameText, 62);
      nameLines.forEach((line, index) => {
        doc.text(line, 6, currentY);
        if (index === 0) {
          doc.text(qtyText, 76, currentY, { align: 'center' });
          doc.text(weightText, 90, currentY, { align: 'center' });
        }
        currentY += 3.8;
      });
    });

    // 7. Return Address & Footer (Fixed Bottom Section)
    // Draw a divider right above return address
    doc.setLineWidth(0.2);
    doc.line(3, 134, 97, 134);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(0);
    doc.text('RETURN ADDRESS:', 6, 137.5);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(80);
    doc.text('ODISHASHOP, Plot-24, Sector A, Zone B, Bhubaneswar, Odisha, India - 751001', 6, 140.5);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(0);
    doc.text('Thank you for buying Odia Handloom, Crafts & Organics!', 50, 145.5, { align: 'center' });

    // Trigger PDF download
    const filename = `shipping_label_${order._id.slice(-6).toUpperCase()}.pdf`;
    doc.save(filename);
    
    return true;
  } catch (error) {
    console.error('Error rendering shipping label PDF:', error);
    throw error;
  }
};

/**
 * Generates and downloads a premium professional Tax Invoice PDF for a delivered order.
 * @param {object} order - The order object.
 */
export const downloadInvoice = async (order) => {
  if (!order) {
    console.error('No order provided to invoice generator.');
    return;
  }

  const year = new Date(order.createdAt).getFullYear();
  const suffix = parseInt(order._id.slice(-4), 16) % 9000 + 1000;
  const invoiceNumber = `INV-${year}-${suffix}`;

  const trackingId = order.trackingId || 'N/A';
  const courierName = order.courierName || 'N/A';
  const paymentMethod = (order.paymentMethod || 'COD').toUpperCase();
  const paymentStatus = order.isPaid ? 'PAID' : 'PENDING / COD';

  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // --- Header Branding ---
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(0);
    doc.text('ODISHASHOP', 15, 20);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text('Authentic Odisha Handloom, Crafts, & Organics', 15, 24);
    doc.text('Plot-24, Sector A, Zone B, Bhubaneswar, Odisha, 751001', 15, 28);
    doc.text('support@odishashop.in | www.odisha.shop', 15, 32);

    // --- Invoice Title ---
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('TAX INVOICE', 195, 20, { align: 'right' });

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`Invoice No: ${invoiceNumber}`, 195, 26, { align: 'right' });
    
    const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    doc.setFont('Helvetica', 'normal');
    doc.text(`Date: ${invoiceDate}`, 195, 31, { align: 'right' });

    // Divider Line
    doc.setDrawColor(200);
    doc.setLineWidth(0.4);
    doc.line(15, 36, 195, 36);

    // --- Section: Billing & Order Metadata ---
    // Left column: Bill To
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('BILL TO:', 15, 45);

    const customerName = (order.shippingAddress?.name || order.user?.name || 'Customer').toUpperCase();
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(customerName, 15, 50);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(80);
    
    const addressLine1 = order.shippingAddress?.line1 || '';
    const cityStatePincode = `${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}`;
    const fullAddressText = `${addressLine1}, ${cityStatePincode}`;
    const addressLines = doc.splitTextToSize(fullAddressText, 80);
    
    let leftY = 54.5;
    addressLines.forEach(line => {
      doc.text(line, 15, leftY);
      leftY += 4;
    });
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(0);
    doc.text(`Phone: ${order.shippingAddress?.phone || 'N/A'}`, 15, leftY + 1.5);

    // Right column: Order details
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('ORDER DETAILS:', 110, 45);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(80);
    doc.text(`Order ID: #${order._id.toUpperCase()}`, 110, 50);
    doc.text(`Payment Method: ${paymentMethod}`, 110, 54);
    doc.text(`Payment Status: ${paymentStatus}`, 110, 58);
    doc.text(`Courier Partner: ${courierName}`, 110, 62);
    doc.text(`Tracking ID: ${trackingId}`, 110, 66);

    // Divider Line
    const bottomMetaY = Math.max(leftY + 6, 70);
    doc.setDrawColor(220);
    doc.setLineWidth(0.2);
    doc.line(15, bottomMetaY, 195, bottomMetaY);

    // --- Table Headers ---
    let tableY = bottomMetaY + 8;
    doc.setFillColor(245, 245, 245);
    doc.rect(15, tableY, 180, 8, 'F'); // Gray background
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(0);
    doc.text('PRODUCT DETAILS', 17, tableY + 5.5);
    doc.text('QTY', 115, tableY + 5.5, { align: 'center' });
    doc.text('UNIT PRICE', 135, tableY + 5.5, { align: 'right' });
    doc.text('DISCOUNT', 165, tableY + 5.5, { align: 'right' });
    doc.text('TOTAL', 193, tableY + 5.5, { align: 'right' });

    tableY += 8;

    // --- Table Content ---
    let subtotal = 0;
    let totalDiscount = 0;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(60);

    order.items.forEach(item => {
      // Split name to avoid line overflow
      const nameText = `${item.name} (${item.weight || '1kg'})`;
      const nameLines = doc.splitTextToSize(nameText, 85);
      
      const qty = item.qty || 1;
      const finalPrice = item.price || 0;
      const originalPrice = item.originalPrice || finalPrice;
      const unitDiscount = originalPrice - finalPrice;
      const itemDiscountTotal = unitDiscount * qty;
      const lineTotal = finalPrice * qty;

      subtotal += originalPrice * qty;
      totalDiscount += itemDiscountTotal;

      const rowHeight = Math.max(nameLines.length * 4.5, 6);
      
      // Draw border bottom
      doc.setDrawColor(240);
      doc.setLineWidth(0.1);
      doc.line(15, tableY + rowHeight, 195, tableY + rowHeight);

      // Print texts
      let currentLineY = tableY + 4.5;
      nameLines.forEach(line => {
        doc.text(line, 17, currentLineY);
        currentLineY += 4.5;
      });

      doc.text(String(qty), 115, tableY + 4.5, { align: 'center' });
      doc.text(`Rs ${originalPrice.toFixed(2)}`, 135, tableY + 4.5, { align: 'right' });
      doc.text(unitDiscount > 0 ? `Rs ${unitDiscount.toFixed(2)}` : 'Rs 0.00', 165, tableY + 4.5, { align: 'right' });
      doc.text(`Rs ${lineTotal.toFixed(2)}`, 193, tableY + 4.5, { align: 'right' });

      tableY += rowHeight;
    });

    // --- Summary Section ---
    tableY += 6;
    doc.setDrawColor(200);
    doc.setLineWidth(0.3);
    doc.line(120, tableY, 195, tableY);
    tableY += 5;

    // Subtotal
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(80);
    doc.text('Subtotal (Gross):', 155, tableY, { align: 'right' });
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(0);
    doc.text(`Rs ${subtotal.toFixed(2)}`, 193, tableY, { align: 'right' });
    
    tableY += 4.5;

    // Total Discount
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(80);
    doc.text('Product Discounts:', 155, tableY, { align: 'right' });
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(0);
    doc.text(`- Rs ${totalDiscount.toFixed(2)}`, 193, tableY, { align: 'right' });

    tableY += 4.5;

    // Delivery Charges
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(80);
    doc.text('Delivery Charges:', 155, tableY, { align: 'right' });
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(0);
    const shippingPrice = order.shippingPrice || 0;
    doc.text(shippingPrice > 0 ? `Rs ${shippingPrice.toFixed(2)}` : 'FREE', 193, tableY, { align: 'right' });

    tableY += 6;
    doc.setDrawColor(0);
    doc.setLineWidth(0.4);
    doc.line(120, tableY, 195, tableY);
    tableY += 6;

    // Total Amount
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('TOTAL AMOUNT:', 155, tableY, { align: 'right' });
    doc.text(`Rs ${order.totalPrice.toFixed(2)}`, 193, tableY, { align: 'right' });

    // --- Footer Section ---
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text('This is a computer-generated tax invoice and requires no physical signature.', 15, 275);
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(0);
    doc.text('Thank you for shopping with OdishaShop! Supporting organic farmers & local artisans.', 15, 280);

    const filename = `Invoice_${invoiceNumber}.pdf`;
    doc.save(filename);
    
    return true;
  } catch (error) {
    console.error('Error rendering invoice PDF:', error);
    throw error;
  }
};
