using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Logging;
using Moq;
using FluentAssertions;
using Products.Models;

namespace Products.API.Test;

[TestFixture]
public class ClientAPITest
{
    private Mock<IClientRepository> _clientRepositoryMock;
    private Mock<ILogger<ClientAPI>> _loggerMock;

    [SetUp]
    public void Setup()
    {
        _clientRepositoryMock = new Mock<IClientRepository>();
        _loggerMock = new Mock<ILogger<ClientAPI>>();
    }

    [Test]
    public async Task GetClient_Success_ReturnsOkResultWithClientData()
    {
        // Arrange
        string numeroIdentificacion = "123456789";
        var client = new Person
        {
            name = "John Doe",
            email = "test@gmail.com",
            phone = "12345678",
            tipoIdentificacion = "01",
            numeroIdentificacion = "123456789"
        };
        _clientRepositoryMock.Setup(repo => repo.GetClient(It.IsAny<string>(), It.IsAny<CancellationToken>())).ReturnsAsync(new List<Person> { client });

        // Act
        var result = await ClientAPI.GetClient(numeroIdentificacion, _clientRepositoryMock.Object, _loggerMock.Object, CancellationToken.None);

        // Assert
        result.Should().BeOfType<Ok<Person>>();
        ((Ok<Person>)result).Value.Should().BeEquivalentTo(client);
    }

    [Test]
    public async Task AddClient_Success_ReturnsOkResultWithClientData()
    {
        // Arrange
        var client = new Person
        {
            name = "John Doe",
            email = "test@gmail.com",
            phone = "12345678",
            tipoIdentificacion = "01",
            numeroIdentificacion = "123456789"
        };
        _clientRepositoryMock.Setup(repo => repo.AddClient(client, CancellationToken.None)).ReturnsAsync(client);

        // Act
        var result = await ClientAPI.AddClient(client, _clientRepositoryMock.Object, _loggerMock.Object, CancellationToken.None);

        // Assert
        result.Should().BeOfType<Ok<Person>>();
        ((Ok<Person>)result).Value.Should().BeEquivalentTo(client);
    }
}

