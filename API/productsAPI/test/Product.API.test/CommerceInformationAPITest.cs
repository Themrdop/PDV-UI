using FluentAssertions;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Logging;
using Moq;
using Products.Interfaces;
using Products.Models;

namespace Products.API.test;

[TestFixture]
public class CommerceInformationAPITest
{
  private Mock<ICommerceInformationRepository> _repositoryMock;
  private Mock<ILogger<CommerceInformationAPI>> _loggerMock;

  [SetUp]
  public void Setup()
  {
    _repositoryMock = new Mock<ICommerceInformationRepository>();
    _loggerMock = new Mock<ILogger<CommerceInformationAPI>>();
  }

  [Test]
  public async Task UpdateCommerceInformation_WithValidArgs_ReturnsSuccess()
  {
    // Arrange
    var commerceInfo = new CommerceInformation() {/*...*/};
    _repositoryMock.Setup(x => x.UpdateCommerceInformation(commerceInfo, CancellationToken.None)).ReturnsAsync(commerceInfo);

    // Act
    var result = await CommerceInformationAPI.updateCommerceInformation(
       commerceInfo, _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    // Assert 
    result.Should().NotBeNull();
    result.Should().BeOfType<Ok<CommerceInformation?>>();
    result.As<Ok<CommerceInformation>>().Value.Should().Be(commerceInfo);
  }

  [Test]
  public async Task UpdateCommerceInformation_WithNullArgs_ReturnsBadRequest()
  {
    // Act
    var result = await CommerceInformationAPI.updateCommerceInformation(
      null, _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    // Assert
    result.Should().NotBeNull();
    result.Should().BeOfType<BadRequest>();
  }

  [Test]
  public async Task UpdateCommerceInformation_WhenException_ReturnsProblem()
  {
    // Arrange
    _repositoryMock.Setup(r => r.UpdateCommerceInformation(It.IsAny<CommerceInformation>(), It.IsAny<CancellationToken>()))
      .Throws<Exception>();

    // Act
    var result = await CommerceInformationAPI.updateCommerceInformation(
       new CommerceInformation(), _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    // Assert
    result.Should().NotBeNull();
    result.Should().BeOfType<ProblemHttpResult>();
  }

  [Test]
  public async Task GetCommerceInformation_WhenCalled_ReturnsCommerceInformation()
  {
    // Arrange
    var expected = new CommerceInformation() { /*...*/ };
    _repositoryMock.Setup(r => r.GetCommerceInformation(It.IsAny<CancellationToken>()))
      .ReturnsAsync(expected);

    // Act
    var result = await CommerceInformationAPI.getCommerceInformation(
      _repositoryMock.Object,
      _loggerMock.Object,
      CancellationToken.None);

    // Assert
    result.Should().BeOfType<Ok<CommerceInformation>>();
    result.As<Ok<CommerceInformation>>().Value.Should().BeEquivalentTo(expected);
  }

  [Test]
  public async Task GetCommerceInformation_WhenException_ReturnsProblem()
  {
    // Arrange
    _repositoryMock.Setup(r => r.GetCommerceInformation(It.IsAny<CancellationToken>()))
      .Throws<Exception>();

    // Act
    var result = await CommerceInformationAPI.getCommerceInformation(
      _repositoryMock.Object,
      _loggerMock.Object,
      CancellationToken.None);

    // Assert
    result.Should().BeOfType<ProblemHttpResult>();
  }
  [Test]
  public async Task SaveCertificateForCommerceAsync_WithValidCert_ReturnsSuccess()
  {
    // Arrange
    var certStream = new MemoryStream();
    _repositoryMock.Setup(r => r.SaveCertificate(certStream, It.IsAny<CommerceInformation>(), It.IsAny<CancellationToken>()))
      .ReturnsAsync(true);

    // Act
    var result = await CommerceInformationAPI.SaveCertificateForCommerceAsync(
      certStream, _repositoryMock.Object, null, CancellationToken.None);

    // Assert
    result.Should().BeOfType<Ok<bool>>();
    result.As<Ok<bool>>().Value.Should().BeTrue();
  }

  [Test]
  public async Task SaveCertificateForCommerceAsync_WithNullCert_ReturnsBadRequest()
  {
    // Act
    var result = await CommerceInformationAPI.SaveCertificateForCommerceAsync(
      null, _repositoryMock.Object, null, CancellationToken.None);

    // Assert
    result.Should().BeOfType<BadRequest>();
  }

  [Test]
  public async Task SaveCertificateForCommerceAsync_WhenException_ReturnsProblem()
  {
    // Arrange
    _repositoryMock.Setup(r => r.SaveCertificate(It.IsAny<Stream>(), It.IsAny<CommerceInformation>(), It.IsAny<CancellationToken>()))
      .ThrowsAsync(new Exception());

    // Act
    var result = await CommerceInformationAPI.SaveCertificateForCommerceAsync(
      new MemoryStream(), _repositoryMock.Object, null, CancellationToken.None);

    // Assert
    result.Should().BeOfType<ProblemHttpResult>();
  }

  [Test]
  public async Task GetCertificate_WithValidArgs_ReturnsStream()
  {
    // Arrange
    var certBytes = new byte[] { 0x01, 0x02 };
    _repositoryMock.Setup(r => r.GetCertificate(It.IsAny<string>(), It.IsAny<CancellationToken>()))
      .ReturnsAsync(certBytes);

    // Act 
    var result = await CommerceInformationAPI.GetCertificate(
      "test", _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    // Assert
    result.Should().BeOfType<FileStreamHttpResult>();
    var stream = result.As<FileStreamHttpResult>().FileStream;
    var resultBytes = new byte[stream.Length];
    while (stream.Position < stream.Length)
    {
      stream.Read(resultBytes, 0, resultBytes.Length);
    }
    resultBytes.Should().BeEquivalentTo(certBytes);
  }


  [Test]
  public async Task GetCertificate_WithNullArgs_ReturnsNotFound()
  {
    // Act
    var result = await CommerceInformationAPI.GetCertificate(
      null, _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    // Assert
    result.Should().BeOfType<NotFound>();
  }

  [Test]
  public async Task GetCertificate_WhenException_ReturnsProblem()
  {
    // Arrange
    _repositoryMock.Setup(r => r.GetCertificate(It.IsAny<string>(), It.IsAny<CancellationToken>()))
      .Throws<Exception>();

    // Act
    var result = await CommerceInformationAPI.GetCertificate(
      "test", _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    // Assert
    result.Should().BeOfType<ProblemHttpResult>();
  }

  [Test]
  public async Task SaveLogo_WithValidLogo_ReturnsSuccess()
  {
    _repositoryMock.Setup(r => r.SaveLogo(It.IsAny<Stream>(), It.IsAny<CommerceInformation>(), It.IsAny<CancellationToken>()))
    .ReturnsAsync(true);

    var result = await CommerceInformationAPI.SaveLogo(new MemoryStream(), _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    result.Should().NotBeNull();
    result.Should().BeOfType<Ok<bool>>();
    result.As<Ok<bool>>().Value.Should().BeTrue();
  }

  [Test]
  public async Task SaveLogo_WithNullLogo_ReturnsBadRequest()
  {
    var result = await CommerceInformationAPI.SaveLogo(null, _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    result.Should().NotBeNull();
    result.Should().BeOfType<BadRequest>();
  }

  [Test]
  public async Task SaveLogo_WhenException_ReturnsProblem()
  {
    // Arrange
    _repositoryMock.Setup(r => r.SaveLogo(It.IsAny<Stream>(), It.IsAny<CommerceInformation>(), It.IsAny<CancellationToken>()))
      .ThrowsAsync(new Exception());

    // Act
    var result = await CommerceInformationAPI.SaveLogo(new MemoryStream(), _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    // Assert
    result.Should().NotBeNull();
    result.Should().BeOfType<ProblemHttpResult>();
  }

  [Test]
  public async Task GetLogo_WithValidArgs_ReturnsLogoStream()
  {
    // Arrange
    var logoBytes = new byte[] { 0x00, 0xff };
    _repositoryMock.Setup(r => r.GetLogo(It.IsAny<string>(), It.IsAny<CancellationToken>()))
      .ReturnsAsync(logoBytes);

    // Act
    var result = await CommerceInformationAPI.GetLogo(
      "test", _repositoryMock.Object, null, CancellationToken.None);

    // Assert
    result.Should().BeOfType<FileStreamHttpResult>();
    var stream = result.As<FileStreamHttpResult>().FileStream;
    var buffer = new byte[logoBytes.Length];
    await stream.ReadAsync(buffer, 0, buffer.Length);
    CollectionAssert.AreEqual(logoBytes, buffer);
  }

  [Test]
  public async Task GetLogo_WithNullLogo_ReturnsBadRequest()
  {
    // Act
    var result = await CommerceInformationAPI.GetLogo(
      null, _repositoryMock.Object, null, CancellationToken.None);

    // Assert
    result.Should().BeOfType<NotFound>();
  }

  [Test]
  public async Task GetLogo_WhenException_ReturnsProblem()
  {
    // Arrange
    _repositoryMock.Setup(r => r.GetLogo(It.IsAny<string>(), It.IsAny<CancellationToken>()))
      .Throws<Exception>();

    // Act
    var result = await CommerceInformationAPI.GetLogo(
      "test", _repositoryMock.Object, null, CancellationToken.None);

    // Assert
    result.Should().BeOfType<ProblemHttpResult>();
  }
}