public class BillAPI
{
    internal static async Task<IResult> Billing(List<Product> products, 
                                                IBillRepository billRepository,
                                                IElectronicBill electronicBill,
                                                ILogger<Product> logger,
                                                CancellationToken cancellationToken)
    {
        if(products is null || !products.Any())
            return Results.BadRequest();
        
        try
        {
            Bill bill = CreateBill(products);
            bill = await electronicBill.SendElectronicBill(bill, cancellationToken);

            var responce = await billRepository.SaveBill(bill, cancellationToken);

            logger?.LogInformation("Factura creada con exito, consecutivo: {consecutive}", responce.consecutive);

            return Results.Ok(responce);
        }
        catch (Exception ex)
        {
            logger?.LogError("Error creando factura, exception: {ex}", ex);

            return Results.Problem(ex.Message);
        }
    }

    internal static async Task<IResult> GetAllBills(DateTime? dateBeginig,
                                                    DateTime? dateEnd,
                                                    IBillRepository billRepository,
                                                    ILogger<Product> logger,
                                                    CancellationToken cancellationToken){
        
        var bills = await billRepository
            .GetAllBills(new Tuple<DateOnly, DateOnly>(DateOnly.FromDateTime(dateBeginig ?? DateTime.MaxValue),DateOnly.FromDateTime(dateEnd ?? DateTime.MinValue)), cancellationToken);
        logger?.LogInformation("Todos las facturas fueron consultados");

        return Results.Ok(bills);                                                   
    }

    private static Bill CreateBill(IEnumerable<Product> products)
    {
        return new Bill(){total = products.Sum(x => x.price),
                          products = products.ToList()};
    }
}