using Moq;
using FluentAssertions;
using Products.Interfaces;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Logging;
using Products.Models;

[TestFixture]
public class ProductsAPITest
{

  private Mock<IProductsRepository> _repositoryMock;
  private Mock<ILogger<ProductsAPI>> _loggerMock;

  [SetUp]
  public void Setup()
  {
    _repositoryMock = new Mock<IProductsRepository>();
    _loggerMock = new Mock<ILogger<ProductsAPI>>();
  }

  [Test]
  public async Task DeleteProduct_WithNullId_ReturnsBadRequest()
  {
    var result = await ProductsAPI.DeleteProduct(null, _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    result.Should().BeOfType<BadRequest>();
  }

  [Test]
  public async Task DeleteProduct_WithEmptyId_ReturnsBadRequest()
  {
    var result = await ProductsAPI.DeleteProduct("", _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    result.Should().BeOfType<BadRequest>();
  }

  [Test]
  public async Task DeleteProduct_CallsRepositoryWithExpectedId()
  {
    await ProductsAPI.DeleteProduct("abc123", _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    _repositoryMock.Verify(r => r.DeleteProduct("abc123", CancellationToken.None));
  }

  [Test]
  public async Task DeleteProduct_HandlesException_ReturnsProblemResult()
  {
    _repositoryMock.Setup(r => r.DeleteProduct(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                 .Throws<Exception>();

    var result = await ProductsAPI.DeleteProduct("abc123", _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    result.Should().BeOfType<ProblemHttpResult>();
  }

  [Test]
  public async Task DeleteProduct_Success_ReturnsOkResult()
  {
    _repositoryMock.Setup(r => r.DeleteProduct(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                 .ReturnsAsync(true);

    var result = await ProductsAPI.DeleteProduct("abc123", _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    result.Should().BeOfType<Ok<bool>>();
  }
  [Test]
  public async Task UpdateProduct_WithNullProduct_ReturnsBadRequest()
  {
    var result = await ProductsAPI.UpdateProduct(null, _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    result.Should().BeOfType<BadRequest>();
  }

  [Test]
  public async Task UpdateProduct_HandlesException_ReturnsProblemResult()
  {
    _repositoryMock.Setup(r => r.UpdateProduct(It.IsAny<Product>(), It.IsAny<CancellationToken>()))
      .Throws<Exception>();

    var result = await ProductsAPI.UpdateProduct(new Product(), _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    result.Should().BeOfType<ProblemHttpResult>();
  }

  [Test]
  public async Task UpdateProduct_Success_ReturnsOkResult()
  {
    Product testProduct = new Product();

    _repositoryMock.Setup(r => r.UpdateProduct(testProduct, It.IsAny<CancellationToken>()))
      .ReturnsAsync(testProduct);

    var result = await ProductsAPI.UpdateProduct(testProduct, _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    result.Should().BeOfType<Ok<Product>>();

    _loggerMock.Verify(l => l.Log(
      LogLevel.Information,
      It.IsAny<EventId>(),
      It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Se actualizo el producto")),
      It.IsAny<Exception>(),
      It.Is<Func<It.IsAnyType, Exception, string>>((v, t) => true)));
  }

  [Test]
  public async Task AddProduct_WithNullProduct_ReturnsBadRequest()
  {
    var result = await ProductsAPI.AddProducts(null, _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    result.Should().BeOfType<BadRequest>();
  }

  [Test]
  public async Task AddProduct_ValidProduct_ReturnsOk()
  {
    Product testProduct = new Product();

    _repositoryMock.Setup(r => r.AddProduct(testProduct, It.IsAny<CancellationToken>()))
      .ReturnsAsync(testProduct);

    var result = await ProductsAPI.AddProducts(testProduct, _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    result.Should().BeOfType<Ok<Product>>();
  }

  [Test]
  public async Task AddProduct_LogsOnSuccess()
  {
    Product testProduct = new Product();

    _repositoryMock.Setup(r => r.AddProduct(testProduct, It.IsAny<CancellationToken>()))
      .ReturnsAsync(testProduct);

    await ProductsAPI.AddProducts(testProduct, _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    _loggerMock.Verify(l => l.Log(
      LogLevel.Information,
      It.IsAny<EventId>(),
      It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Se inserto el producto")),
      It.IsAny<Exception>(),
      It.Is<Func<It.IsAnyType, Exception, string>>((v, t) => true)));
  }

  [Test]
  public async Task AddProduct_HandlesException_ReturnsProblemResult()
  {
    _repositoryMock.Setup(r => r.AddProduct(It.IsAny<Product>(), It.IsAny<CancellationToken>()))
      .Throws<Exception>();

    var result = await ProductsAPI.AddProducts(new Product(), _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    result.Should().BeOfType<ProblemHttpResult>();
  }

  [Test]
  public async Task GetAllProducts_WithNullId_ReturnsAllProducts()
  {
    // Arrange
    _repositoryMock.Setup(r => r.GetAllProducts(It.IsAny<CancellationToken>()))
      .ReturnsAsync(new List<Product>());

    var loggerMock = new Mock<ILogger<ProductsAPI>>();

    // Act
    var result = await ProductsAPI.GetAllProducts(null, _repositoryMock.Object, loggerMock.Object, CancellationToken.None);

    // Assert
    result.Should().BeOfType<Ok<IEnumerable<Product>>>();
    var value = result.As<Ok<IEnumerable<Product>>>().Value as List<Product>;
    value.Should().NotBeNull();
  }

  [Test]
  public async Task GetAllProducts_WithValidId_ReturnsProduct()
  {
    // Arrange
    string productId = "abc123";
    var product = new Product { id = productId };

    var repositoryMock = new Mock<IProductsRepository>();
    repositoryMock.Setup(r => r.ProductById(productId, It.IsAny<CancellationToken>()))
      .ReturnsAsync(product);

    var loggerMock = new Mock<ILogger<ProductsAPI>>();

    // Act
    var result = await ProductsAPI.GetAllProducts(productId, repositoryMock.Object, loggerMock.Object, CancellationToken.None);

    // Assert
    result.Should().BeOfType<Ok<IEnumerable<Product>>>();
    var value = result.As<Ok<IEnumerable<Product>>>().Value as List<Product>;
    value.Should().HaveCount(1);
    value.First().id.Should().Be(productId);
  }

  [Test]
  public async Task GetAllProducts_WithInvalidId_ReturnsEmptyList()
  {
    // Arrange
    string productId = "invalid123";

    var repositoryMock = new Mock<IProductsRepository>();
    repositoryMock.Setup(r => r.ProductById(It.IsAny<string>(), It.IsAny<CancellationToken>()))
      .ReturnsAsync((Product)null);

    var loggerMock = new Mock<ILogger<ProductsAPI>>();

    // Act
    var result = await ProductsAPI.GetAllProducts(productId, repositoryMock.Object, loggerMock.Object, CancellationToken.None);

    // Assert
    result.Should().BeOfType<Ok<IEnumerable<Product>>>();
    var value = result.As<Ok<IEnumerable<Product>>>().Value as List<Product>;
    value.Should().BeEmpty();
  }

  [Test]
  public async Task GetAllProducts_HandlesException_ReturnsProblemResult()
  {
    // Arrange
    var repositoryMock = new Mock<IProductsRepository>();
    repositoryMock.Setup(r => r.GetAllProducts(It.IsAny<CancellationToken>()))
      .Throws<Exception>();

    var loggerMock = new Mock<ILogger<ProductsAPI>>();

    // Act
    var result = await ProductsAPI.GetAllProducts(null, repositoryMock.Object, loggerMock.Object, CancellationToken.None);

    // Assert
    result.Should().BeOfType<ProblemHttpResult>();
  }

}