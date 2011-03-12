require 'rubygems'
require 'bundler/setup'
require 'dm-core'
require 'dm-types'
require 'dm-redis-adapter'
require 'dm-timestamps'
require 'dm-validations'
require 'dm-aggregates'
require 'dm-migrations'
require 'haml'
require 'ostruct'
require 'json'
require 'dalli'

require 'sinatra' unless defined?(Sinatra)

configure do
  # load models
  $LOAD_PATH.unshift("#{File.dirname(__FILE__)}/lib")
  Dir.glob("#{File.dirname(__FILE__)}/lib/*.rb") { |lib| require File.basename(lib, '.*') }
  DataMapper.setup(:default, {:adapter  => "redis"})
  # Memcache
  MEMCACHE = Dalli::Client.new('localhost:11211',:expires_in=> 60)
  
end
