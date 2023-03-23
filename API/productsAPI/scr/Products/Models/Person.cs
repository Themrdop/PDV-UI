namespace Products.Models
{
    public class Person
    {
        public const string TIPO_IDENTIFICACION_FISICA = "01";
        public const string TIPO_IDENTIFICACION_JURIDICA = "02";
        public string name;

        public string tipoIdentificacion {get; set;} = TIPO_IDENTIFICACION_FISICA;
        public string numeroIdentificacion { get; set; } = string.Empty;

        static public explicit operator MensajeHaciendaTipoIdentificacionReceptor(Person from)
        {
            return from.tipoIdentificacion switch
            {
                TIPO_IDENTIFICACION_FISICA => MensajeHaciendaTipoIdentificacionReceptor.Item01,
                TIPO_IDENTIFICACION_JURIDICA => MensajeHaciendaTipoIdentificacionReceptor.Item02,
                _ => throw new Exception("Tipo de identificacion no soportado")
            };
        }

        static public explicit operator MensajeHaciendaTipoIdentificacionEmisor(Person from)
        {
            return from.tipoIdentificacion switch
            {
                TIPO_IDENTIFICACION_FISICA => MensajeHaciendaTipoIdentificacionEmisor.Item01,
                TIPO_IDENTIFICACION_JURIDICA => MensajeHaciendaTipoIdentificacionEmisor.Item02,
                _ => throw new Exception("Tipo de identificacion no soportado")
            };
        }
    }
}