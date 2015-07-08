# In Rails 4, the default method for encrypting cookies, is changed to AES-256-CBC.  In JRuby, in Java, this level of
# encryption is higher than the "US legal limit" for what strength of cryptography can be exported. So, I am overriding
# Rails to use a lower level of cryptography.
#
# A Rails dev suggests this, here, along with an example diff of code changes which I have copied out below:
# https://github.com/rails/rails/pull/12256

# KT: This matches what is used in ChorusEncryptor.
ENCRYPTED_COOKIE_CIPHER = "aes-128-cbc"

module ActionDispatch
  class Cookies
    class EncryptedCookieJar

      def initialize(parent_jar, key_generator, options = {})
        if ActiveSupport::LegacyKeyGenerator === key_generator
          raise "You didn't set config.secret_key_base, which is required for this cookie jar. " +
                  "Read the upgrade documentation to learn more about this new config option."
        end

        @parent_jar = parent_jar
        @options = options
        secret = key_generator.generate_key(@options[:encrypted_cookie_salt])
        sign_secret = key_generator.generate_key(@options[:encrypted_signed_cookie_salt])

        @encryptor = ActiveSupport::MessageEncryptor.new(secret, sign_secret, :cipher => ENCRYPTED_COOKIE_CIPHER)
      end
    end
  end
end