Ideas
---

The following is example of what I would like to evolve Beardo into doing. Once [issue #17](https://github.com/bnvk/Beardo/issues/17) is implemented, the direction I'd like to go is something like this...


```
beardo> open path/to/schema.json
----------------------------------------------
Imported: Client Werk
Loaded: 3 datasets
 - Clients_2015.csv
 - Clients_2014.csv
 - Clients_2013.csv
----------------------------------------------
Yay, you imported some things. Want to create a magic spell? (Y/n)
beardo> Y
Name this spell
beardo> Client Invoices
What type of spell is this: 
1 invoice
2 graph
3 profit-loss
beardo> invoice
Great. We found a template that matches your schema
...
```

At this point is the more tricky part which I haven't really given enough thought to. But here is where a dataset could be "mapped" via commands (or at some point a GUI) to a template... so I have this old collection of hours from a time tracking program- at this stage a user would need to probably iterate through each "required template value" something like:

```
Select an item from dataset that represent `hours_worked`
- date
- time
- client
- description
- rate
beardo> time
...
```

Of course, the "template" could probably have it's own `invoice.json` schema that expresses something like  `hours_worked` only accepts `number` inputs which would help sculpt the inputs above. Or perhaps doing inside the HTML template itself using [Microformats](http://microformats.org) would be more clever... accept that only works for HTML templates.

This would of course get tricky if a user has loaded mutiple datasets which have different schemas as the [JSON Table Schema](http://dataprotocols.org/json-table-schema/) supports. However, it still should be doable thing and only add one or two extra steps to creating the "spell"

After the schema is all mapped, thee is just one remaining step:

```
How do you plan to cast this spell:
1 html
2 pdf
3 json
beardo> html,pdf
Great. Ready to do some magic. Just tell me what to output
beardo> --trim client:eHealth --date 2015-02 
generating report...
...
beardo> --trim client:Mailpile --date 2015-02
...
```

Any major blindspots I'm missing?
