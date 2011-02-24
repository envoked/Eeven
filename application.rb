require 'rubygems'
require 'bundler/setup'
require 'sinatra'
require File.join(File.dirname(__FILE__), 'environment')

configure do
  set :views, "#{File.dirname(__FILE__)}/views"
end

error do
  e = request.env['sinatra.error']
  Kernel.puts e.backtrace.join("\n")
  'Application error'
end

helpers do
  # add your helpers here
end

# root page
get '/' do
  haml :index
  
  
end

get '/split/save' do
  
end

post '/split/save' do
  matrix = JSON.parse(params[:data])
  if matrix.has_key? 'Error'
     puts 'Error'
  else
    puts matrix.inspect
  end 
end






get '/css/main.css' do
  sass :'/stylesheets/main'
end
