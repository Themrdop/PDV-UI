using Products.Models;
namespace Products.Interfaces{
    public interface ICommerceInformationRepository
    {
        Task<CommerceInformation> GetCommerceInformation(CancellationToken cancellationToken);
        Task<CommerceInformation> UpdateCommerceInformation(CommerceInformation commerceInformation, CancellationToken cancellationToken);
    }
}