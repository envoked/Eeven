require File.join(File.dirname(__FILE__), 'application')
require 'sass/plugin/rack'


set :run, false
set :environment, :production

FileUtils.mkdir_p 'log' unless File.exists?('log')
log = File.new("log/sinatra.log", "a+")
$stdout.reopen(log)
$stderr.reopen(log)

run Eeven
