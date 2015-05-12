Chorus::Application.configure do
  # Custom config options up top:

  # See: https://github.com/Chorus/chorus/commit/0044cca46e8d17ccff6cbcfde3204967a535ddaf
  ActionMailer::Base.default from: 'Test Mailer <testmailer@example.com>', reply_to: 'Test Replyto <test_replyto@example.com>'

  # See: http://guides.rubyonrails.org/caching_with_rails.html#activesupport-cache-nullstore
  # KT: If we remove this, 2 tests fail because of model level caching in Dataset.
  config.cache_store = :null_store


  # DEFAULT RAILS CONFIG OPTIONS below

  # Settings specified here will take precedence over those in config/application.rb

  # The test environment is used exclusively to run your application's
  # test suite. You never need to work with it otherwise. Remember that
  # your test database is "scratch space" for the test suite and is wiped
  # and recreated between test runs. Don't rely on the data there!
  config.cache_classes = true

  # Configure static asset server for tests with Cache-Control for performance
  config.serve_static_assets = true
  config.static_cache_control = "public, max-age=3600"

  # Log error messages when you accidentally call methods on nil
  config.whiny_nils = true

  # Show full error reports and disable caching
  config.consider_all_requests_local       = true
  config.action_controller.perform_caching = false

  # Raise exceptions instead of rendering exception templates
  config.action_dispatch.show_exceptions = false

  # Disable request forgery protection in test environment
  config.action_controller.allow_forgery_protection    = false

  # Tell Action Mailer not to deliver emails to the real world.
  # The :test delivery method accumulates sent emails in the
  # ActionMailer::Base.deliveries array.
  config.action_mailer.delivery_method = :test

  # Raise exception on mass assignment protection for Active Record models
  # KT TODO: uncomment this
  # config.active_record.mass_assignment_sanitizer = :strict

  # Print deprecation notices to the stderr
  config.active_support.deprecation = :stderr
end
