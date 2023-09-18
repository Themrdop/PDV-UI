using System.Net.WebSockets;

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

      Bill bill = CreateBill(localBill, new Person()
                             {
                               name = commers.name,
                               numeroIdentificacion = commers.cedula,
                               tipoIdentificacion = Person.TIPO_IDENTIFICACION_JURIDICA,
                               phone = commers.phone,
                               email = commers.email
                             }, commers);

      bill = await billRepository.SaveBill(bill, cancellationToken);

      //logger?.LogInformation("Enviando factura electronica");
      //bill = await electronicBill.SendElectronicBill(bill, cancellationToken);

      await productsRepository.RemoveProductsFromInventary(localBill.products, cancellationToken);

      //await billRepository.UpdateAddElectronicBill(bill, cancellationToken);

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

  internal static async Task<IResult> GetDaylyReport(DateTime? dateBeginig,
                                                    DateTime? dateEnd,
                                                    IBillRepository billRepository,
                                                    ILogger<Product> logger,
                                                    CancellationToken cancellationToken)
  {
    var bills = await billRepository
        .GetAllBills(new Tuple<DateOnly, DateOnly>(DateOnly.FromDateTime(dateBeginig ?? DateTime.MaxValue), DateOnly.FromDateTime(dateEnd ?? DateTime.MinValue)), cancellationToken);
    
    logger?.LogInformation("Todos las facturas fueron consultados");

    var report = new Report().FromBills(bills);

    return Results.Ok(report.products);
  }

  private static Bill CreateBill(LocalBill localBill, Person? emmiter, CommerceInformation commerce)
  {
    var bill = new Bill()
    {
      total = localBill.products.Sum(x => x.price),
      products = localBill.products.ToList(),
      Descuento = localBill.descuento,
      MedioPago = localBill.metodoPago,
      Efectivo = localBill.efectivo,
      NumeroVoucher = localBill.numeroVoucher
    };

    if (localBill.recipient is not null && emmiter is not null)
      bill.electronicBill = new ElectronicBill()
      {
        recepient = localBill.recipient,
        emitter = emmiter,
        Comers = commerce
      };

    return bill;
  }

  public class LocalBill
  {
    public List<Product> products { get; set; } = new();
    public Person? recipient { get; set; } = new();
    public decimal descuento { get; set; } = 0M;
    public IEnumerable<TipoPago> metodoPago { get; set; } = new List<TipoPago>();
    public int numeroVoucher { get; set; } = 0;
    public decimal efectivo { get; set; } = 0;
  }

  public class Report
  {
    public List<Line> products = new List<Line>();
    public DateTime date = new DateTime();

    public Report FromBills(IEnumerable<Bill> bills){
      var report = new Report();
      var products = new List<Product>();

      date = DateTime.UtcNow;

      foreach (var bill in bills)
      {
        products.AddRange(bill.products);
      }

      this.products = (from product in products
                      group product by product.id into g
                      select new Line (products.First(x => x.id == g.Key), products.Where(x => x.id == g.Key).Sum(x => x.amount))).ToList(); 

      return this;
    }
  }

  public record Line(Product product,int count);
}