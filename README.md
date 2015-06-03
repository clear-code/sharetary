# Sharetary

Sharetary is a cross-origin events viewer.
The name is neoterized from two terms "share" and "secretary".

This provides ability to watch various "events" stored into a Groonga server, in real time or analytically by two different views:

 * Timeline view - You can watch events in real time, like Twitter or something. Newly added events will appear on the top of the view automatically.
 * Archive view - You can watch events statically, with their relations. Related events are visible as a thread.


## How to start the server?

    $ npm install sharetary
    $ sharetary-server

You must install Node.js and npm before installation.
For example, on Ubuntu 14.04LTS:

    $ sudo apt-get install nodejs nodejs-legacy npm

See `sharetary-server --help` for more details.


## How to crawl events?

Sharetary doesn't provide ability to crawl events from sources.
You need to crawl and load events by something other way.

In other words, you can use any data source for Sharetary, if you load them to the database in a common format described at this section.

Sharetary uses [Groonga](http://groonga.org) or [Droonga](http://droonga.org/) as its backend.
You simply have to define a table named `Events` with following columns (and load events to the table):

 * `_key` (any type):
   Something to identify each event uniquely.
   For example, URI string, hash string, or others.
 * `type` (`Text` or `ShortText`):
   Indicates the type of each event.
   For example, an event indicating a "push" activity on the GitHub will have the string `push` as its `type`.
 * `class` (`Text` or `ShortText`):
   Indicates the magnitude of each event.
   Three possible values: `important`, `major`, and `minor`.
   `important` and `major` events will be highlighted in the view.
 * `scope` (`Text` or `ShortText`):
   Indicates the scope of grouped events.
   For example, events from GitHub activities will belong to any repository, so their repository name is suitable as the scope.
 * `scope_icon` (`Text` or `ShortText`):
   URI of the icon for the scope.
 * `title` (`Text` or `ShortText`):
   Short description of each event.
   For example, an event indicating a "push" activity on the GitHub will have its `title` like: "Pushed N commits to the repository".
 * `description` (`Text` or `ShortText`):
   The main description of each event.
   For example, an event indicating a "commit" activity on the GitHub will have its commit message as its `description`.
 * `uri` (`Text` or `ShortText`):
   The related URI of each event.
 * `reply_uri` (`Text` or `ShortText`):
   The URI of an UI to post any reply for each event.
   For example, an event indicating a "commit" activity on the GitHub will have link to the comment form of the commit as its `reply_uri`.
   If your crawler fetches posted comments from the UI also, then you'll see them as events related to the parent event.
 * `actor` (`Text` or `ShortText`):
   Indicates the actor's name of each event.
   For example, an events from GitHub activity will have the account id as its `actor`.
 * `actor_icon` (`Text` or `ShortText`):
   URI of the icon for the actor.
 * `actor_class` (`Text` or `ShortText`):
   Indicates the magnitude of the actor.
   Two possible values: `major`, and `minor`.
   Events triggered by `minor` actors will be shown with small text and lighter color in the view.
   For example, if you have events triggered by both students and teachers and you hope to see students' events mainly, then students are `major` and teachers are `minor`.
 * `timestamp` (`Time'):
   The time when the event was triggered at.
   Events are sorted by this field in the archive view.
 * `created_at` (`Time'):
   The time when the record of the event was loaded to the database.
   Events are sorted by this field in the timeline view.
 * `parent` (`Text` or `ShortText`):
   The `_key` of another event.
   For example, an event indicating a "issue comment" activity on the GitHub will have the `_key` of the "issue opened" event as its `parent`.

See [the example schema](sample/schema.grn) also.

Any other column can be defined at the `Events` table, as you like.
Moreover, of course, any other table is also allowed in the database.
Sharetary simply ignores them.


## Typical use case: watching users' activities on the GitHub

This section describes how to crawl GitHub activities by fluentd, on a Ubuntu 14.04 server.

 1. [Install Groonga with the instruction](http://groonga.org/docs/install/ubuntu.html).
    (If you have your existing Groonga or Droonga, you can skip this step.)
 2. Install fluentd and td-agent.
    
    ~~~
    $ sudo apt-get install ntp
    $ sudo service ntp restart
    $ curl -L http://toolbelt.treasuredata.com/sh/install-ubuntu-trusty-td-agent2.sh | sudo sh
    $ sudo mkdir -p /var/spool/td-agent/buffer/
    $ sudo chown -R td-agent:td-agent /var/spool/td-agent/
    ~~~
 3. Install required fluentd plugins.
    
    ~~~
    $ sudo td-agent-gem install fluent-plugin-github-activities
    $ sudo td-agent-gem install fluent-plugin-map
    $ sudo td-agent-gem install fluent-plugin-record-reformer
    ~~~
 4. Install fluent-plugin-groonga. It requires some extra packages.
    
    ~~~
    $ sudo apt-get install ruby ruby-dev build-essential
    $ sudo td-agent-gem install fluent-plugin-groonga
    ~~~
 5. Configure td-agent.
    
    ~~~
    $ sudo vi /etc/td-agent/td-agent.conf
    ~~~
    
    See also [the example configuration to crawl and load GitHub activities](sample/fluent-plugin-github-activities.conf).
    It includes rules to convert fetched GitHub activities to Sharetary events.
 6. Start td-agent.
    
    ~~~
    $ sudo service td-agent start
    ~~~
