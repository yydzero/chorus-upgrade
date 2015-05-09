# Load the rails application
require File.expand_path('../application', __FILE__)

# Initialize the rails application
Chorus::Application.initialize!

Chorus::Application.configure do
  # ignore exception on mass assignment protection for Active Record models
  config.active_record.mass_assignment_sanitizer = :logger

  config.action_mailer.default_url_options = {
      protocol: ChorusConfig.instance['ssl.enabled'] ? 'https' : 'http',
      host: ChorusConfig.instance.public_url,
      port: ChorusConfig.instance.server_port
  }
end
