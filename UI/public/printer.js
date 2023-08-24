/*const {PosPrinter} = require("electron-pos-printer");

  const options = {
    preview: true,
    margin: '0 0 0 0',    
    copies: 2,
    timeOutPerLine: 400,
    pageSize: '80mm' // page size
  }

  module.exports = 
  {
    print: async function print(arg) 
    {
        //console.log(arg);
        let timeElapsed = Date.now();
        let today = new Date(timeElapsed);
        let data = [
            {
              type: 'table',
              // style the table
              style: {border: '0px solid #ddd'},
              // multi dimensional array depicting the rows and columns of the table body
              tableBody: [],
              // custom style for the table header
              tableHeaderStyle: { backgroundColor: 'white', color: '#000'},
              // custom style for the table body
              tableBodyStyle: {'border': '0px solid #ddd'},
              // custom style for the table footer
              tableFooterStyle: {backgroundColor: '#000', color: 'white'},
            }
          ];
          data.unshift({
            type: 'text',
            value: "<br/>-----------------------------------------------------------------------<br/>",
            style: {textAlign:'left', fontSize: "12px"}
          });
          data.unshift({
            type: 'text',
            value: "Fecha: " + today.toLocaleDateString(),
            style: {textAlign:'left', fontSize: "12px"}
          });
          data.unshift({
            type: 'text',
            value: "Numero de factura: " + arg.bill.consecutive,
            style: {textAlign:'left', fontSize: "12px"}
          });
        data.unshift({
            type: 'text',                                       
            value: arg.commers.address,
            style: {fontWeight: "100", textAlign: 'center', fontSize: "14px"}
        });
        
        data.unshift({
            type: 'text',                                       
            value: arg.commers.email,
            style: {fontWeight: "100", textAlign: 'center', fontSize: "14px"}
        });
        
        data.unshift({
            type: 'text',                                       
            value: arg.commers.phone,
            style: {fontWeight: "100", textAlign: 'center', fontSize: "14px"}
        });
        
        data.unshift({
            type: 'text',                                       
            value: arg.commers.cedula,
            style: {fontWeight: "100", textAlign: 'center', fontSize: "14px"}
        });
        
        data.unshift({
            type: 'text',                                       
            value: arg.commers.name,
            style: {fontWeight: "bold", textAlign: 'center', fontSize: "14px"}
        });
        
        console.log(data);
        arg.bill.products.map(p => {
            data[8].tableBody.push([p.name, p.amount, p.price]);
        });
        data.push({
            type: 'text',
            value: "<br/>-----------------------------------------------------------------------<br/>",
            style: {textAlign:'left', fontSize: "12px"}
        });
        data.push({
            type: 'text',                                       
            value: "<br/>Total: " + arg.bill.products.reduce((partialSum, product) => partialSum + (product.price * product.amount), 0),
            style: {fontWeight: "bold", textAlign: 'center', fontSize: "14px"}
        });

        try {
            await PosPrinter.print(data, options)
        } catch (error) {
            console.error(error);
        }
    }
}*/