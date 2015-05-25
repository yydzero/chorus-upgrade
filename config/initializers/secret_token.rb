# Be sure to restart your server when you modify this file.

# Your secret key is used for verifying the integrity of signed cookies.
# If you change this key, all old signed cookies will become invalid!

# Make sure the secret is at least 30 characters and all random,
# no regular words or you'll be exposed to dictionary attacks.
# You can use `rake secret` to generate a secure secret key.

# Make sure your secret_key_base is kept private
# if you're sharing your code publicly.

token_file = Rails.root.join('config/secret.token')
abort "No config/secret.token file found.  Run rake development:init or rake development:generate_secret_token" unless token_file.exist?

Chorus::Application.config.secret_token = token_file.read


key_file = Rails.root.join('config/secret.key')
abort "No config/secret.key file found.  Run rake development:init or rake development:generate_secret_key" unless key_file.exist?

Chorus::Application.config.secret_key_base = key_file.read


#Myapp::Application.config.secret_token = 'existing secret token'
#Myapp::Application.config.secret_key_base = 'new secret key base'