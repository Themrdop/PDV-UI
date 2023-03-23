namespace Products.Models
{
    public class Product
    {
        public string id { get; set; } = string.Empty;
        public string title {get; set;} = string.Empty;
        public decimal price {get; set;} = 0.0M;
        public string image {get; set;} = string.Empty;
        public int amount { get; set; } = 0;

        public override string ToString()
        {
            return $"ID: {id}, {title} con precio {price.ToString("C2")} y cantidad {amount}";
        }
    }   
}