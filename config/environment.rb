# Load the Rails application.
require File.expand_path('../application', __FILE__)

# Initialize the Rails application.
Chorus::Application.initialize!

Chorus::Application.configure do
  # ignore exception on mass assignment protection for Active Record models
  # See: https://github.com/Chorus/chorus/commit/486c8df94207db7a62b137110b9781663ccdff6b
  config.active_record.mass_assignment_sanitizer = :logger

  # "Job Failure/Success events send out emails"
  # See: https://github.com/Chorus/chorus/commit/c1d78b99d68736321f970deeaacdff708b5834d7
  config.action_mailer.default_url_options = {
      protocol: ChorusConfig.instance['ssl.enabled'] ? 'https' : 'http',
      host: ChorusConfig.instance.public_url,
      port: ChorusConfig.instance.server_port
  }
end
