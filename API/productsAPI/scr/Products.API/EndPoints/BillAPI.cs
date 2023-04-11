public class BillAPI
{
  internal static async Task<IResult> Billing(LocalBill localBill,
                                              IBillRepository billRepository,
                                              IElectronicBill electronicBill,
                                              IProductsRepository productsRepository,
                                              ICommerceInformationRepository commerceInformationRepository,
                                              ILogger<Product> logger,
                                              CancellationToken cancellationToken)
  {
    if (localBill is null || localBill.products is null || !localBill.products.Any())
      return Results.BadRequest();

    try
    {
      var commers = await commerceInformationRepository.GetCommerceInformation(cancellationToken);

      Bill bill = CreateBill(localBill.products, localBill.recipient,
                             new Person()
                             {
                               name = commers.name,
                               numeroIdentificacion = commers.cedula,
                               tipoIdentificacion = Person.TIPO_IDENTIFICACION_JURIDICA,
                               phone = commers.phone,
                               email = commers.email
                             }, localBill.descuento);

      bill = await billRepository.SaveBill(bill, cancellationToken);

      logger?.LogInformation("Enviando factura electronica");
      bill = await electronicBill.SendElectronicBill(bill, cancellationToken);

      await productsRepository.RemoveProductsFromInventary(localBill.products, cancellationToken);

      await billRepository.UpdateAddElectronicBill(bill, cancellationToken);

      logger?.LogInformation("Factura creada con exito, consecutivo: {consecutive}", bill.consecutive);

      return Results.Ok(bill);
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
                                                  CancellationToken cancellationToken)
  {

    var bills = await billRepository
        .GetAllBills(new Tuple<DateOnly, DateOnly>(DateOnly.FromDateTime(dateBeginig ?? DateTime.MaxValue), DateOnly.FromDateTime(dateEnd ?? DateTime.MinValue)), cancellationToken);
    logger?.LogInformation("Todos las facturas fueron consultados");

    return Results.Ok(bills);
  }

  private static Bill CreateBill(IEnumerable<Product> products, Person? recipient, Person? emmiter, decimal descuento = 0M)
  {
    var bill = new Bill()
    {
      total = products.Sum(x => x.price),
      products = products.ToList(),
      Descuento = descuento,

    };

    if (recipient is not null && emmiter is not null)
      bill.electronicBill = new ElectronicBill()
      {
        recepient = recipient,
        emitter = emmiter
      };

    return bill;
  }

  public class LocalBill
  {
    public List<Product> products { get; set; } = new();
    public Person? recipient { get; set; } = new();
    public decimal descuento { get; set; } = 0M;
    public IEnumerable<Pago> tipoPago { get; set; } = new List<Pago>();
  }
}