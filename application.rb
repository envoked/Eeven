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
  alphanumerics = [('0'..'9'),('A'..'Z'),('a'..'z')].map {|range| range.to_a}.flatten
  id = (0...10).map { alphanumerics[Kernel.rand(alphanumerics.size)] }.join
  redirect "/split/#{id}" 
end

get '/bill/:id' do
  @id = params[:id]
  haml :split
end

get '/split/:id' do
  @id = params[:id]   
  haml :split
end

get '/split/get/:id' do
  @split = Split.get(params[:id])
  @split.data.to_json
end

post '/split/save' do
  matrix = JSON.parse(params[:data])
  if matrix.has_key? 'Error'
     puts 'Error'
  else
    split = Split.create({:id=>matrix['id'],:data=> matrix})
  end
   
end

get '/split/isActive/:id' do
  key = "eeven:#{params[:id]}"
  active = MEMCACHE.get(key) != request.ip
  MEMCACHE.set(key, request.ip, 60)
  return active.to_s
  
end






get '/css/main.css' do
  sass :'/stylesheets/main'
end
