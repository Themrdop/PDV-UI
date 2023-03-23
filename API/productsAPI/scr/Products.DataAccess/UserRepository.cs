using MongoDB.Driver;
using Products.Interfaces;
using Products.Models;

namespace Products.DataAccess
{
    public class UserRepository : IUserRepository
    {
        private readonly DataBaseImplementation _database;

        public UserRepository(DataBaseImplementation database)
        {
            _database = database;
        }

        public async Task<IEnumerable<User>> GetUsers(CancellationToken cancellationToken)
        {
            var baseUsers = await _database.Users.FindAsync(Builders<User>.Filter.Empty, null, cancellationToken);

            var users = baseUsers.ToList();

            if (users is null)
                return new List<User>();

            return users;
        }
        
        public async Task<User> GetUserById(string id, CancellationToken cancellationToken)
        {
            var user = await _database.Users.FindAsync(Builders<User>.Filter.Eq(p => p.Id, id), null, cancellationToken);

            return user.FirstOrDefault();
        }

        public async Task<User> SaveUser(User user, CancellationToken cancellationToken)
        {
            user.Id = Guid.NewGuid().ToString();

            await _database.Users.InsertOneAsync(user, null, cancellationToken);

            return user;
        }

        public async Task<User> UpdateUser(User user, CancellationToken cancellationToken)
        {
            var filter = Builders<User>.Filter.Eq(p => p.Id, user.Id);

            var result = await _database.Users.ReplaceOneAsync(filter, user);

            if (result.ModifiedCount == 0)
            {
                await _database.Users.InsertOneAsync(user);
            }

            return user;
        }

        public async Task<User> DeleteUser(string id, CancellationToken cancellationToken)
        {
            var filter = Builders<User>.Filter.Eq(p => p.Id, id);

            var result = await _database.Users.DeleteOneAsync(filter, null, cancellationToken);

            return result.DeletedCount > 0 ? new User() : null;
        }
    }
}