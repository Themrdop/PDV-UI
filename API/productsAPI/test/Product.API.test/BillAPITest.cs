namespace Product.API.test;

public class BillAPITest
{
    [SetUp]
    public void Setup()
    {
    }

    [Test]
    public async Task TestBilling()
    {
        //Arrange
        var localBill = new LocalBill()
        {
            products = new List<LocalProduct>()
            {
                new LocalProduct()
                {
                    id = 1,
                    quantity = 1
                }
            }
        };

        var billRepository = Substitute.For<IBillRepository>();
        var electronicBill = Substitute.For<IElectronicBill>();
        var productsRepository = Substitute.For<IProductsRepository>();
        var commerceInformationRepository = Substitute.For<ICommerceInformationRepository>();
        var logger = Substitute.For<ILogger<Product>>();

        var cancellationToken = new CancellationToken();

        var commers = new CommerceInformation()
        {
            name = "name",
            cedula = "cedula",
            phone = "phone",
            email = "email"
        };

        commerceInformationRepository.GetCommerceInformation(cancellationToken).Returns(commers);

        var bill = new Bill()
        {
            consecutive = 1
        };

        billRepository.SaveBill(Arg.Any<Bill>(), cancellationToken).Returns(bill);

        //Act
        var result = await BillAPI.Billing(localBill, billRepository, electronicBill, productsRepository, commerceInformationRepository, logger, cancellationToken);

        //Assert
        Assert.AreEqual(1, result.Value.consecutive);
    }

    [Test]
    public async Task TestGetAllBills()
    {
        //Arrange
        var billRepository = Substitute.For<IBillRepository>();
        var logger = Substitute.For<ILogger<Product>>();
        var cancellationToken = new CancellationToken();

        var bills = new List<Bill>()
        {
            new Bill()
            {
                consecutive = 1
            }
        };

        billRepository.GetAllBills(Arg.Any<Tuple<DateOnly, DateOnly>>(), cancellationToken).Returns(bills);

        //Act
        var result = await BillAPI.GetAllBills(null, null, billRepository, logger, cancellationToken);

        //Assert
        Assert.AreEqual(1, result.Value.Count);
    }

    [Test]
    public async Task TestGetBillByDateRange()
    {
        //Arrange
        var billRepository = Substitute.For<IBillRepository>();
        var logger = Substitute.For<ILogger<Product>>();
        var cancellationToken = new CancellationToken();

        var bills = new List<Bill>()
        {
            new Bill()
            {
                consecutive = 1
            }
        };

        billRepository.GetBillByDateRange(Arg.Any<Tuple<DateOnly, DateOnly>>(), cancellationToken).Returns(bills);

        //Act
        var result = await BillAPI.GetBillByDateRange(new Tuple<DateOnly, DateOnly>(new DateOnly(), new DateOnly()), billRepository, logger, cancellationToken);

        //Assert
        Assert.AreEqual(1, result.Value.Count);
    }

    [Test]
    public async Task TestGetDaylyReport()
    {
        //Arrange
        var billRepository = Substitute.For<IBillRepository>();
        var logger = Substitute.For<ILogger<Product>>();
        var cancellationToken = new CancellationToken();

        var bills = new List<Bill>()
        {
            new Bill()
            {
                consecutive = 1
            }
        };

        billRepository.GetDaylyReport(Arg.Any<DateOnly>(), cancellationToken).Returns(bills);

        //Act
        var result = await BillAPI.GetDaylyReport(new DateOnly(), billRepository, logger, cancellationToken);

        //Assert
        Assert.AreEqual(1, result.Value.Count);
    }
}