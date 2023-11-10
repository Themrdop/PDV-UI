public static class EndPointConfiguration{
    public static void ConfigureApi(this WebApplication app){
        app.MapGet("/GetAllProducts",ProductsAPI.GetAllProducts);
        app.MapPost("/AddProduct",ProductsAPI.AddProducts);
        app.MapPut("/UpdateProduct",ProductsAPI.UpdateProduct);
        app.MapDelete("/DeleteProduct",ProductsAPI.DeleteProduct);
        app.MapPost("/SaveBill",BillAPI.Billing);
        app.MapGet("/GetAllBills", BillAPI.GetAllBills);
        app.MapPut("/AddElectronicBill", BillAPI.AddElectronicBill);
        app.MapGet("/GetCommerceInformation", CommerceInformationAPI.getCommerceInformation);
        app.MapPost("/UpdateCommerceInformation", CommerceInformationAPI.updateCommerceInformation);
        app.MapPost("/SaveCertificateForCommerce", CommerceInformationAPI.SaveCertificateForCommerceAsync);
        app.MapGet("/GetCertificate", CommerceInformationAPI.GetCertificate);
        app.MapPost("/SaveLogo", CommerceInformationAPI.SaveLogo);
        app.MapGet("/GetLogo", CommerceInformationAPI.GetLogo);
        app.MapGet("/GetUsers", UserAPI.GetUsers);
        app.MapPost("/AddUser", UserAPI.SaveUser);
        app.MapDelete("/DeleteUser", UserAPI.DeleteUser);
        app.MapPost("/UpdateUser", UserAPI.UpdateUser);
        app.MapGet("/GetUserById", UserAPI.GetUserById);
        app.MapGet("/GetAllCombos", CombosAPI.GetCombos);
        app.MapGet("/GetComboById", CombosAPI.GetComboById);
        app.MapPost("/AddCombo", CombosAPI.SaveCombo);
        app.MapDelete("/DeleteCombo", CombosAPI.DeleteCombo);
        app.MapPost("/UpdateCombo", CombosAPI.UpdateCombo);
        app.MapGet("/GetClient", ClientAPI.GetClient);
        app.MapPost("/AddClient", ClientAPI.AddClient);
        app.MapGet("/GetReport", BillAPI.GetDaylyReport);
    }
}