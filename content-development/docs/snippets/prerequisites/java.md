### 🧰 Prerequisites

{% if tools or required or beneficial %}

In addition to the usual [Prerequisites](../../prerequisites/java) you will require the following: 
<!-- was before absolute link which does not work with different sites:  (../../prerequisites/java){target=_blank} -->

{% else %}

Please see the usual [Prerequisites](../../prerequisites/java).

{% endif %}

{% if tools %}

#### 🛠️  Tools

{% for entry in tools %}
  - {{ entry }}
{% endfor %}

{% endif %}

{% if required or beneficial %}

#### 📚 Knowledge

{% if required %}

- Required:

{% for entry in required %}
    - {{ entry }}
{% endfor %}

{% endif %}

{% if beneficial %}

- Beneficial:

{% for entry in beneficial %}
    - {{ entry }}
{% endfor %}

{% endif %}

{% endif %}



