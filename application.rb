require 'rubygems'
require 'bundler/setup'
require 'sinatra'
require File.join(File.dirname(__FILE__), 'environment')

class Eeven < Sinatra::Base
  register Sinatra::RespondTo
  
  configure do
    set :views, "#{File.dirname(__FILE__)}/views"
    set :logging, true
    set :haml,{:preserve=>["pre","span","source"]}
    set :scss, {:style=>:compressed}

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

  get '/stylesheet' do
    sass :style
  end


  get '/split/:id' do
    @split = Split.first(:id=> params[:id]) || Split.create({:id=>params[:id]})
    respond_to do |wants|
      wants.html {haml :'split'}
      wants.js {@split.data.to_json}
    end  

  end

  post '/split/:id' do
    matrix = JSON.parse(params[:data])
    if matrix.has_key? 'Error'
       puts 'Error'
    else
      split = Split.create({:id=>matrix['id'],:data=> matrix})
    end

  end

  get '/split/isActive/:id' do
    key = "eeven:#{params[:id]}"
    # being clever-- maybe it's slower then the corresponding conditonal      
    active = [nil,request.ip].include?(MEMCACHE.get(key))
    MEMCACHE.set(key, request.ip, 60)
    return active.to_s

  end


end
