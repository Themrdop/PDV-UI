using MongoDB.Driver;
using Products.Interfaces;
using Products.Models;

namespace Products.DataAccess{
    public class ComboRepository : IComboRepository{
        private readonly DataBaseImplementation _database;
        public ComboRepository(DataBaseImplementation database){
            _database = database;
        }
        public async Task<IEnumerable<Combo>> GetCombos(CancellationToken cancellationToken){
            var baseCombos = await _database.Combos.FindAsync(Builders<Combo>.Filter.Empty, null, cancellationToken);
            var combos = await baseCombos.ToListAsync();
            if (combos is null)
                return new List<Combo>();
            return combos;
        }

        public async Task<Combo> GetComboById(string id, CancellationToken cancellationToken){
            var combo = await _database.Combos.FindAsync(Builders<Combo>.Filter.Eq(p => p.id, id), null, cancellationToken);
            return combo.FirstOrDefault();
        }

        public async Task<Combo> SaveCombo(Combo combo, CancellationToken cancellationToken){
            combo.id = Guid.NewGuid().ToString();
            await _database.Combos.InsertOneAsync(combo, null, cancellationToken);
            return combo;
        }

        public async Task<Combo> UpdateCombo(Combo combo, CancellationToken cancellationToken){
            var filter = Builders<Combo>.Filter.Eq(p => p.id, combo.id);
            var result = await _database.Combos.ReplaceOneAsync(filter, combo);
            if (result.ModifiedCount == 0){
                await _database.Combos.InsertOneAsync(combo);
            }
            return combo;
        }

        public async Task<bool> DeleteCombo(string id, CancellationToken cancellationToken){
            var filter = Builders<Combo>.Filter.Eq(p => p.id, id);
            var result = await _database.Combos.DeleteOneAsync(filter, null, cancellationToken);
            return result.DeletedCount > 0;
        }

    }
}