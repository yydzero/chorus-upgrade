class TagsController < ApplicationController
  def index
    tags = params[:q].present? ? Tag.named_like(params[:q]) : Tag.all
    # Replace sort_by with order clause to let database do the sorting instead of Ruby. It is much faster.
#    present paginate(tags.sort_by!{ |tag| tag.name.downcase })
    present paginate(tags.order(:name))

  end

  def update
    tag = Tag.find(params[:id])
    tag.name = params[:tag][:name]
    tag.save!

    present tag
  end

  def destroy
    tag = Tag.find(params[:id])
    authorize! :destroy, tag
    tag.destroy

    head :ok
  end
end
