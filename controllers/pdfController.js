const PDFDocument = require('pdfkit');
const bwipjs = require('bwip-js');

exports.generarPDF = (req, res) => {
  const { n_paca, variedad, clase, gavillas_funda, gavillas_paca, fecha_elaboracion } = req.body;

  const doc = new PDFDocument({
    size: [7.6 * 28.35, 5 * 28.35],
    margins: {
      top: 0.5 * 28.35,
      bottom: 0.5 * 28.35,
      left: 0.5 * 28.35,
      right: 0.5 * 28.35
    }
  });

  doc.fontSize(9);
  doc.text(`N° Paca: ${n_paca}`);
  doc.text(`Variedad: ${variedad}`);
  doc.text(`Clase: ${clase}`);
  doc.text(`Gavillas funda: ${gavillas_funda}`);
  doc.text(`Gavillas paca: ${gavillas_paca}`);
  doc.text(`Fecha elaboración: ${fecha_elaboracion}`);

  const barcodeData = nPaca; // aquí se define el valor del código de barras a partir de nPaca
  bwipjs.toBuffer({
    bcid: 'code128',
    text: barcodeData,
    scale: 1,
    height: 13,
    includetext: true,
    textxalign: 'center'
  }, function (err, png) {
    if (err) {
      console.log(err);
      res.status(500).send('Error generando código de barras');
    } else {
      doc.image(png, {
        fit: [60, 40],
        align: 'center',
        valign: 'center'
      });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="pacas_${nPaca}.pdf"`);
      doc.pipe(res);
      doc.end();
    }
  });
};
