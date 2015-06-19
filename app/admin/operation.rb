ActiveAdmin.register Operation do

  menu priority: 6

# See permitted parameters documentation:
# https://github.com/activeadmin/activeadmin/blob/master/docs/2-resource-customization.md#setting-up-strong-parameters
#
  permit_params :name, :description
# or
#
# permit_params do
#   permitted = [:permitted, :attributes]
#   permitted << :other if resource.something?
#   permitted
#

  index do
    # column 'User Name' do |user|
    #   link_to "#{user.username}", "/admin/users/#{user.id}"
    # end
    column :name
    column :description
    column 'Chorus Class' do |operation|
     text_node "#{operation.chorus_class.name}".html_safe
    end
  end


end
