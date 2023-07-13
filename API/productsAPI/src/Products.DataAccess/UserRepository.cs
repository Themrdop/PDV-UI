using MongoDB.Driver;
using Products.Interfaces;
using Products.Models;

namespace Products.DataAccess
{
    public class UserRepository : IUserRepository
    {
        private IMongoCollection<User> Users;

        public UserRepository(DataBaseImplementation mongo)
        {
            Users = mongo.database.GetCollection<User>("Users");
        }

        public async Task<IEnumerable<User>> GetUsers(CancellationToken cancellationToken)
        {
            var baseUsers = await Users.FindAsync(Builders<User>.Filter.Empty, null, cancellationToken);

            var users = baseUsers.ToList();

            if (users is null)
                return new List<User>();

            return users;
        }
        
        public async Task<User> GetUserById(string id, CancellationToken cancellationToken)
        {
            var user = await Users.FindAsync(Builders<User>.Filter.Eq(p => p.Id, id), null, cancellationToken);

            return user.FirstOrDefault();
        }

        public async Task<User> SaveUser(User user, CancellationToken cancellationToken)
        {
            user.Id = Guid.NewGuid().ToString();

            await Users.InsertOneAsync(user, null, cancellationToken);

            return user;
        }

        public async Task<User> UpdateUser(User user, CancellationToken cancellationToken)
        {
            var filter = Builders<User>.Filter.Eq(p => p.Id, user.Id);

            var result = await Users.ReplaceOneAsync(filter, user);

            if (result.ModifiedCount == 0)
            {
                await Users.InsertOneAsync(user);
            }

            return user;
        }

        public async Task<bool> DeleteUser(string id, CancellationToken cancellationToken)
        {
            var filter = Builders<User>.Filter.Eq(p => p.Id, id);

            var result = await Users.DeleteOneAsync(filter, null, cancellationToken);

            return result.DeletedCount > 0;
        }
    }
}