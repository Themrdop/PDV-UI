using MongoDB.Driver;
using Products.Interfaces;
using Products.Models;

namespace Products.DataAccess{
    public class ComboRepository : IComboRepository{
        public IMongoCollection<Combo> Combos { get; internal set; }

        public ComboRepository(DataBaseImplementation mongo){
            Combos = mongo.database.GetCollection<Combo>("Combos");
        }
        public async Task<IEnumerable<Combo>> GetCombos(CancellationToken cancellationToken){
            var baseCombos = await Combos.FindAsync(Builders<Combo>.Filter.Empty, null, cancellationToken);
            var combos = await baseCombos.ToListAsync();
            if (combos is null)
                return new List<Combo>();
            return combos;
        }

        public async Task<Combo> GetComboById(string id, CancellationToken cancellationToken){
            var combo = await Combos.FindAsync(Builders<Combo>.Filter.Eq(p => p.id, id), null, cancellationToken);
            return combo.FirstOrDefault();
        }

        public async Task<Combo> SaveCombo(Combo combo, CancellationToken cancellationToken){
            combo.id = Guid.NewGuid().ToString();
            await Combos.InsertOneAsync(combo, null, cancellationToken);
            return combo;
        }

        public async Task<Combo> UpdateCombo(Combo combo, CancellationToken cancellationToken){
            var filter = Builders<Combo>.Filter.Eq(p => p.id, combo.id);
            var result = await Combos.ReplaceOneAsync(filter, combo);
            if (result.ModifiedCount == 0){
                await Combos.InsertOneAsync(combo);
            }
            return combo;
        }

        public async Task<bool> DeleteCombo(string id, CancellationToken cancellationToken){
            var filter = Builders<Combo>.Filter.Eq(p => p.id, id);
            var result = await Combos.DeleteOneAsync(filter, null, cancellationToken);
            return result.DeletedCount > 0;
        }

    }
}