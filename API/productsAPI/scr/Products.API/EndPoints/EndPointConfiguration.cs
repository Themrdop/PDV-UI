public static class EndPointConfiguration{
    public static void ConfigureApi(this WebApplication app){
        app.MapGet("/GetAllProducts",ProductsAPI.GetAllProducts);
        app.MapPost("/AddProduct",ProductsAPI.AddProducts);
        app.MapDelete("/DeleteProduct",ProductsAPI.DeleteProduct);
        app.MapPost("/SaveBill",BillAPI.Billing);
        app.MapGet("/GetAllBills", BillAPI.GetAllBills);
        app.MapGet("/GetCommerceInformation", CommerceInformationAPI.getCommerceInformation);
        app.MapPost("/UpdateCommerceInformation", CommerceInformationAPI.updateCommerceInformation);
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
    }
}