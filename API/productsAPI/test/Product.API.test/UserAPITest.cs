using Moq;
using FluentAssertions;
using Products.Interfaces;
using Microsoft.Extensions.Logging;
using Products.Models;
using Microsoft.AspNetCore.Http.HttpResults;

[TestFixture]
public class UserAPITest
{
  private Mock<IUserRepository> _repositoryMock;
  private Mock<ILogger<UserAPI>> _loggerMock;

  [SetUp]
  public void Setup()
  {
    _repositoryMock = new Mock<IUserRepository>();
    _loggerMock = new Mock<ILogger<UserAPI>>();
  }

  [Test]
  public async Task GetUsers_WhenCalled_ReturnsUsers()
  {
    // Arrange
    _repositoryMock.Setup(r => r.GetUsers(It.IsAny<CancellationToken>()))
      .ReturnsAsync(new List<User>());

    // Act
    var result = await UserAPI.GetUsers(_repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    // Assert
    result.Should().BeOfType<Ok<IEnumerable<User>>>();
  }

  [Test]
  public async Task GetUsers_WhenError_ReturnsProblem()
  {
    // Arrange 
    _repositoryMock.Setup(r => r.GetUsers(It.IsAny<CancellationToken>()))
      .ThrowsAsync(new Exception("Error"));

    // Act
    var result = await UserAPI.GetUsers(_repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    // Assert
    result.Should().BeOfType<ProblemHttpResult>();
  }

  [Test]
  public async Task GetUserById_WhenCalledWithValidId_ReturnsUser()
  {
    // Arrange
    var expectedUser = new User() { Id = "1" };
    _repositoryMock.Setup(r => r.GetUserById("1", It.IsAny<CancellationToken>()))
      .ReturnsAsync(expectedUser);

    // Act
    var result = await UserAPI.GetUserById("1", _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    // Assert
    result.Should().BeOfType<Ok<User>>();
    result.As<Ok<User>>().Value.Should().BeEquivalentTo(expectedUser);
  }

  [Test]
  public async Task GetUserById_WhenCalledWithInvalidId_ReturnsNotFound()
  {
    // Arrange
    _repositoryMock.Setup(r => r.GetUserById(It.IsAny<string>(), It.IsAny<CancellationToken>()))
      .ReturnsAsync((User)null);

    // Act
    var result = await UserAPI.GetUserById("invalid", _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    // Assert
    result.Should().BeOfType<NotFound>();
  }

  [Test]
  public async Task GetUserById_WhenError_ReturnsProblem()
  {
    // Arrange
    _repositoryMock.Setup(r => r.GetUserById(It.IsAny<string>(), It.IsAny<CancellationToken>()))
      .ThrowsAsync(new Exception("Error"));

    // Act
    var result = await UserAPI.GetUserById("1", _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    // Assert
    result.Should().BeOfType<ProblemHttpResult>();
  }

  [Test]
  public async Task SaveUser_WithValidUser_SavesUser() 
  {
    // Arrange
    var user = new User{ Id = "1", Name = "Test User" };
    _repositoryMock.Setup(r => r.SaveUser(user, It.IsAny<CancellationToken>()))
      .ReturnsAsync(user);

    // Act
    var result = await UserAPI.SaveUser(user, _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    // Assert
    result.Should().BeOfType<Ok<User>>();
    result.As<Ok<User>>().Value.Should().BeEquivalentTo(user);
  }

  [Test]
  public async Task SaveUser_WithNullUser_ReturnsBadRequest()
  {
    // Arrange
    User user = null;

    // Act
    var result = await UserAPI.SaveUser(user, _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    // Assert
    result.Should().BeOfType<BadRequest>();
  }

  [Test]
  public async Task UpdateUser_WithValidUser_UpdatesUser()
  {
    // Arrange
    var user = new User { Id = "1", Name = "Test User" };
    _repositoryMock.Setup(r => r.UpdateUser(user, It.IsAny<CancellationToken>()))
      .ReturnsAsync(user);

    // Act
    var result = await UserAPI.UpdateUser(user, _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    // Assert
    result.Should().BeOfType<Ok<User>>();
    result.As<Ok<User>>().Value.Should().BeEquivalentTo(user);
  }

  [Test]
  public async Task UpdateUser_WithNullUser_ReturnsBadRequest() 
  {
    // Arrange
    User user = null;

    // Act
    var result = await UserAPI.UpdateUser(user, _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    // Assert
    result.Should().BeOfType<BadRequest>();
  }

  [Test]
  public async Task UpdateUser_WhenError_ReturnsProblem()
  {
    // Arrange
    var user = new User { Id = "1" };
    _repositoryMock.Setup(r => r.UpdateUser(user, It.IsAny<CancellationToken>()))
      .ThrowsAsync(new Exception("Error"));

    // Act
    var result = await UserAPI.UpdateUser(user, _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    // Assert
    result.Should().BeOfType<ProblemHttpResult>();
  }

  [Test]
  public async Task DeleteUser_WithValidId_DeletesUser()
  {
    // Arrange
    _repositoryMock.Setup(r => r.DeleteUser("1", It.IsAny<CancellationToken>()))
      .ReturnsAsync(true);

    // Act
    var result = await UserAPI.DeleteUser("1", _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    // Assert
    result.Should().BeOfType<Ok<bool>>();
    result.As<Ok<bool>>().Value.Should().BeTrue();
  }

  [Test] 
  public async Task DeleteUser_WithInvalidId_ReturnsNotFound()
  {
    // Arrange
    _repositoryMock.Setup(r => r.DeleteUser(It.IsAny<string>(), It.IsAny<CancellationToken>()))
      .ReturnsAsync(false);

    // Act
    var result = await UserAPI.DeleteUser("invalid", _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    // Assert
    result.Should().BeOfType<NotFound>();
  }

  [Test]
  public async Task DeleteUser_WhenError_ReturnsProblem()
  {
    // Arrange
    _repositoryMock.Setup(r => r.DeleteUser(It.IsAny<string>(), It.IsAny<CancellationToken>()))
      .ThrowsAsync(new Exception("Error"));

    // Act
    var result = await UserAPI.DeleteUser("1", _repositoryMock.Object, _loggerMock.Object, CancellationToken.None);

    // Assert
    result.Should().BeOfType<ProblemHttpResult>();
  }
}