# example model file
class Split
  include DataMapper::Resource

  property :id,         String,:key=> true
  property :data,       Json
end
