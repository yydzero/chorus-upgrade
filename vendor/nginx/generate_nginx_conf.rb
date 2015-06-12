require 'erb'
require 'yaml'

chorus_home = File.expand_path(File.dirname(__FILE__) + '/../../')
require File.join(chorus_home, 'app/models/chorus_config')

destination_path = chorus_home + '/vendor/nginx/nginx_dist/nginx_data/conf'
nginx_template_path = chorus_home + '/vendor/nginx/nginx.conf.erb'
chorus_config = ChorusConfig.new chorus_home
rails_env = ENV['RAILS_ENV']
ip6_enabled = system("/sbin/ifconfig | grep inet6 > /dev/null")

template = ERB.new File.read(nginx_template_path)

File.open("#{destination_path}/nginx.conf", 'w') do |f|
  f.write template.result(binding)
end
