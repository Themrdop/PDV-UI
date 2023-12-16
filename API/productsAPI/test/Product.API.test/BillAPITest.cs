using Products.Interfaces;
using Moq;
using Products.Models;
using Microsoft.Extensions.Logging;
using RabbitMQHandler;
using static BillAPI;
using FluentAssertions;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Products.API.test;

public class BillAPITest
{
    private Mock<IBillRepository> _billRepositoryMock;
    private Mock<ICommerceInformationRepository> _commerceInformationRepositoryMock;
    private Mock<IProductsRepository> _productsRepositoryMock;
    private Mock<IMessageQueue> _messageQueueMock;
    private Mock<ILogger<BillAPI>> _loggerMock;


    [SetUp]
    public void Setup()
    {
        _billRepositoryMock = new Mock<IBillRepository>();
        _commerceInformationRepositoryMock = new Mock<ICommerceInformationRepository>();
        _productsRepositoryMock = new Mock<IProductsRepository>();
        _loggerMock = new Mock<ILogger<BillAPI>>();
        _messageQueueMock = new Mock<IMessageQueue>();

    }

    [Test]
    public async Task TestBilling()
    {
        //Arrange
        var bill = new LocalBill()
        {
            products = new List<Product>()
            {
                new Product()
                {
                    id = Guid.Empty.ToString(),
                    name = "Test",
                    price = 1000,
                    amount = 1
                }
            }
        };

        var commerceResponse = new CommerceInformation()
        {
            name = "Test",
            cedula = "123456789",
            address = "Test",
            phone = "123456789",
            email = ""
        };
        var billResponse = new Bill()
        {
            products = new List<Product>()
            {
                new Product()
                {
                    id = Guid.Empty.ToString(),
                    name = "Test",
                    price = 1000,
                    amount = 1
                }
            }
        };

        _billRepositoryMock.Setup(x => x.SaveBill(It.IsAny<Bill>(), It.IsAny<CancellationToken>())).ReturnsAsync(billResponse);
        _commerceInformationRepositoryMock.Setup(x => x.GetCommerceInformation(It.IsAny<CancellationToken>())).ReturnsAsync(commerceResponse);

        //Act
        var result = await BillAPI.Billing(bill, _billRepositoryMock.Object
                                           , _productsRepositoryMock.Object,
                                           _commerceInformationRepositoryMock.Object,
                                           _loggerMock.Object, _messageQueueMock.Object,
                                           CancellationToken.None);

        //Assert
        result.Should().NotBeNull();
        result.Should().BeOfType<Ok<Bill>>();
        result.As<Ok<Bill>>().Value.Should().Be(billResponse);
    }

    [Test]
    public async Task TestBillingWithNullBill()
    {
        //Act
#pragma warning disable CS8625 // Cannot convert null literal to non-nullable reference type.
        var result = await BillAPI.Billing(null, _billRepositoryMock.Object
                                           , _productsRepositoryMock.Object,
                                           _commerceInformationRepositoryMock.Object,
                                           _loggerMock.Object, _messageQueueMock.Object,
                                           CancellationToken.None);
#pragma warning restore CS8625 // Cannot convert null literal to non-nullable reference type.

        //Assert
        result.Should().NotBeNull();
        result.Should().BeOfType<BadRequest>();
    }

    [Test]
    public async Task TestBillingWithNullProducts()
    {
        //Arrange
#pragma warning disable CS8625 // Cannot convert null literal to non-nullable reference type.
        var bill = new LocalBill()
        {
            products = null
        };
#pragma warning restore CS8625 // Cannot convert null literal to non-nullable reference type.

        //Act
        var result = await BillAPI.Billing(bill, _billRepositoryMock.Object
                                           , _productsRepositoryMock.Object,
                                           _commerceInformationRepositoryMock.Object,
                                           _loggerMock.Object, _messageQueueMock.Object,
                                           CancellationToken.None);

        //Assert
        result.Should().NotBeNull();
        result.Should().BeOfType<BadRequest>();
    }

    [Test]
    public async Task TestBillingWithEmptyProducts()
    {
        //Arrange
        var bill = new LocalBill()
        {
            products = new List<Product>()
        };

        //Act
        var result = await BillAPI.Billing(bill, _billRepositoryMock.Object
                                           , _productsRepositoryMock.Object,
                                           _commerceInformationRepositoryMock.Object,
                                           _loggerMock.Object, _messageQueueMock.Object,
                                           CancellationToken.None);

        //Assert
        result.Should().NotBeNull();
        result.Should().BeOfType<BadRequest>();
    }

    [Test]
    public async Task TestBillingWithNullCommerceInformation()
    {
        //Arrange
        var bill = new LocalBill()
        {
            products = new List<Product>()
            {
                new Product()
                {
                    id = Guid.Empty.ToString(),
                    name = "Test",
                    price = 1000,
                    amount = 1
                }
            }
        };

        _commerceInformationRepositoryMock.Setup(x => x.GetCommerceInformation(It.IsAny<CancellationToken>())).ReturnsAsync((CommerceInformation)null);

        //Act
        var result = await BillAPI.Billing(bill, _billRepositoryMock.Object
                                           , _productsRepositoryMock.Object,
                                           _commerceInformationRepositoryMock.Object,
                                           _loggerMock.Object, _messageQueueMock.Object,
                                           CancellationToken.None);

        //Assert
        result.Should().NotBeNull();
        result.Should().BeOfType<ProblemHttpResult>();
    }

    [Test]
    public async Task TestBillingWithNullCommerceInformationName()
    {
        //Arrange
        var bill = new LocalBill()
        {
            products = new List<Product>()
            {
                new Product()
                {
                    id = Guid.Empty.ToString(),
                    name = "Test",
                    price = 1000,
                    amount = 1
                }
            }
        };

#pragma warning disable CS8625 // Cannot convert null literal to non-nullable reference type.
        var commerceResponse = new CommerceInformation()
        {
            name = null,
            cedula = "123456789",
            address = "Test",
            phone = "123456789",
            email = ""
        };
#pragma warning restore CS8625 // Cannot convert null literal to non-nullable reference type.

        _commerceInformationRepositoryMock.Setup(x => x.GetCommerceInformation(It.IsAny<CancellationToken>())).ReturnsAsync(commerceResponse);

        //Act
        var result = await BillAPI.Billing(bill, _billRepositoryMock.Object
                                           , _productsRepositoryMock.Object,
                                           _commerceInformationRepositoryMock.Object,
                                           _loggerMock.Object, _messageQueueMock.Object,
                                           CancellationToken.None);

        //Assert
        result.Should().NotBeNull();
        result.Should().BeOfType<ProblemHttpResult>();
    }

    [Test]
    public async Task TestAddElectronicBill()
    {
        //Arrange
        var bill = new Bill()
        {
            products = new List<Product>()
            {
                new Product()
                {
                    id = Guid.Empty.ToString(),
                    name = "Test",
                    price = 1000,
                    amount = 1
                }
            }
        };

        var commerceResponse = new CommerceInformation()
        {
            name = "Test",
            cedula = "123456789",
            address = "Test",
            phone = "123456789",
            email = ""
        };

        _commerceInformationRepositoryMock.Setup(x => x.GetCommerceInformation(It.IsAny<CancellationToken>())).ReturnsAsync(commerceResponse);

        //Act
        var result = await BillAPI.AddElectronicBill(bill, _billRepositoryMock.Object,
                                           _loggerMock.Object,
                                           CancellationToken.None);

        //Assert
        result.Should().NotBeNull();
        result.Should().BeOfType<Ok<Bill>>();
    }

    [Test]
    public async Task TestAddElectronicBillWithNullBill()
    {
        //Act
#pragma warning disable CS8625 // Cannot convert null literal to non-nullable reference type.
        var result = await BillAPI.AddElectronicBill(null, _billRepositoryMock.Object,
                                           _loggerMock.Object,
                                           CancellationToken.None);
#pragma warning restore CS8625 // Cannot convert null literal to non-nullable reference type.

        //Assert
        result.Should().NotBeNull();
        result.Should().BeOfType<BadRequest>();
    }

    [Test]
    public async Task TestGetAllBills()
    {
        //Arrange
        var bill = new Bill()
        {
            products = new List<Product>()
            {
                new Product()
                {
                    id = Guid.Empty.ToString(),
                    name = "Test",
                    price = 1000,
                    amount = 1
                }
            },
            date = new DateTime(2021, 12, 12).ToUniversalTime()
        };

        var bills = new List<Bill>()
        {
            bill
        };

        _billRepositoryMock.Setup(x => x.GetAllBills(It.IsAny<CancellationToken>())).ReturnsAsync(bills);

        //Act
        var result = await BillAPI.GetAllBills(null, null, _billRepositoryMock.Object,
                                           _loggerMock.Object,
                                           CancellationToken.None);

        //Assert
        result.Should().NotBeNull();
        result.Should().BeOfType<Ok<IEnumerable<Bill>>>();
        result.As<Ok<IEnumerable<Bill>>>().Value.Should().BeEquivalentTo(bills);
    }

    //add unit test for get all bills in the date range 12-12-2021 to 12-12-2021
    [Test]
    public async Task TestGetAllBillsWithDateRange()
    {
        //Arrange
        var bill = new Bill()
        {
            products = new List<Product>()
            {
                new Product()
                {
                    id = Guid.Empty.ToString(),
                    name = "Test",
                    price = 1000,
                    amount = 1
                }
            },
            date = new DateTime(2021, 12, 12).ToUniversalTime()
        };

        var bills = new List<Bill>()
        {
            bill
        };

        _billRepositoryMock.Setup(x => x.GetAllBills(It.IsAny<CancellationToken>())).ReturnsAsync(bills);

        //Act
        var result = await BillAPI.GetAllBills(new DateTime(2021, 12, 12), new DateTime(2021, 12, 12), _billRepositoryMock.Object,
                                           _loggerMock.Object,
                                           CancellationToken.None);

        //Assert
        result.Should().NotBeNull();
        result.Should().BeOfType<Ok<IEnumerable<Bill>>>();
        result.As<Ok<IEnumerable<Bill>>>().Value.Should().BeEquivalentTo(bills);
    }
}