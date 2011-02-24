# example model file
class Split
  include DataMapper::Resource

  property :id,         Serial
  property :link,       String
  property :created_at, DateTime
  property :updated_at, DateTime
  has n,  :people
end

class Person
  include DataMapper::Resource
  property :id, Serial
  property :name, String
  has n, :bills
  has n, :debts, :child_key =>  [:owee_id]
end

class Bill
  include DataMapper::Resource
  property :id,         Serial
  property :amount,     Integer
  property :memo,       String
  belongs_to :person
end


class Debt
  include DataMapper::Resource
  property :person_id, Integer, :key => true, :min => 1  
  property :target_id, Integer, :key => true, :min => 1  
  property :paid, Boolean
  
  belongs_to :person, 'Person', :key=> true
  belongs_to :target, 'Person', :key=> true
  

end 
