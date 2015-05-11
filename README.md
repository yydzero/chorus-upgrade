# What is this repo?

@prakash-alpine & @kevin-alpine are upgrading Chorus to work with the latest versions of Rails, RSpec, and other gems,
as well as performing other tasks:

* removing the dependency on postgres, and restoring database agnosticism
* removing the dependency on the solr search plugin
* swapping out the queue_classic background processing library for the more modern [Sidekiq](http://sidekiq.org/)

When the work is done, we will copy the models and model specs from this repository, into the new 
[persistence component](https://github.com/Chorus/ensemble/tree/master/components/persistence).  This repository will
serve as a bridge between the [current Chorus repo](https://github.com/Chorus/chorus), and 
[the new one](https://github.com/Chorus/ensemble). 

Here is a general plan of the work:
 
1. Upgrade from Rails 3.2 to 4.0 (following the [Rails Upgrade Guide](http://edgeguides.rubyonrails.org/upgrading_ruby_on_rails.html)). 
2. Upgrade from Rails 4.0 to 4.1. 
3. Upgrade from RSpec 2 to RSpec 3 using the [automated Transpec tool](http://yujinakayama.me/transpec/). 
4. Comment out all Solr related code. 
5. Replace queue_classic with Sidekiq.
6. Using sqlite3 as test database, try to remove postgres specific code.
6. TBD misc other tasks 
   
As we upgrade, with each step, we'll keep the ~2900 test RSpec model testing suite green.  I will carry out the work
in a series of branches so that each step can be reviewed via Github PRs.  We will be able to merge ongoing work from
the Chorus repo by `cp -R app/models .` and then using `git rebase` to reapply our upgrades to the new code.  (Likewise,
although we don't anticipate this happening, we could potentially merge the upgrades back to the main Chorus repo.)