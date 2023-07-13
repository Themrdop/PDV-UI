using Products.Models;

namespace Products.Interfaces{
    public interface IElectronicBill
    {
        Task<Bill> SendElectronicBill(Bill bill, CancellationToken cancellationToken);
    }
}