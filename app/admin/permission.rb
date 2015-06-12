ActiveAdmin.register Permission do

  menu priority: 5
# See permitted parameters documentation:
# https://github.com/activeadmin/activeadmin/blob/master/docs/2-resource-customization.md#setting-up-strong-parameters
#
permit_params :role_id, :chorus_class_id, :permissions_mask


index do
  # column 'User Name' do |user|
  #   link_to "#{user.username}", "/admin/users/#{user.id}"
  # end
  column :role_id
  column :chorus_class_id
  column :permissions_mask

end
#
# or
#
# permit_params do
#   permitted = [:permitted, :attributes]
#   permitted << :other if resource.something?
#   permitted
# end


end
