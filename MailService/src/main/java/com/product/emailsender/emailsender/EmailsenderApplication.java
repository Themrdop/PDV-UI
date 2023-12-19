package com.product.emailsender.emailsender;

import com.product.emailsender.emailsender.models.MongoConfig;
import com.product.emailsender.emailsender.util.PropertiesUtils;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.connection.CachingConnectionFactory;
import org.springframework.beans.factory.annotation.Autowired;

@SpringBootApplication
public class EmailsenderApplication {

	static final String topicExchangeName = "spring-boot-exchange";
	static final String queueName = "product.SendEmail";

	private Receiver receiver;
	private MongoConfig mongoConfig;

	@Autowired
	public EmailsenderApplication(Receiver receiver,
                                  MongoConfig mongoConfig) {
		this.receiver = receiver;
		this.mongoConfig = mongoConfig;
	}

	@Bean
	Queue queue() {
		return new Queue(queueName, false);
	}

	@Bean
	TopicExchange exchange() {
		return new TopicExchange(topicExchangeName);
	}

	@Bean
	Binding binding(Queue queue, TopicExchange exchange) {
		return BindingBuilder.bind(queue).to(exchange).with("foo.bar.#");
	}

	@Bean
    public CachingConnectionFactory connectionFactory() {
        return new CachingConnectionFactory(mongoConfig.getHost());
    }

	@RabbitListener(queues = "product.SendEmail")
	public void listen(String in) throws Exception {
		receiver.receiveMessage(in);
	}

	public static void main(String[] args) {
		PropertiesUtils.initProperties();

		SpringApplication.run(EmailsenderApplication.class, args);
	}

}
