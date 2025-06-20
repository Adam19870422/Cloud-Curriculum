{#- 
Description:

The snippet is designed to be a section in the exercise page to encourage learners to rate and provide feedback.

The stars are all hollow by default to encourage learners to rate.

Snippet Usage:

{% include "snippets/rating-section.md" %}

-#}
{%- set resource = "cc-materials-" ~ 
  (
    page.url.split("/")
      |reject("equalto", "")
      |join("-")
      |default("index", true)
  )
-%}

## 🌟 Do you like it?
<div style="display: flex">
    Rate this exercise:&nbsp;&nbsp;
    <div class="rating-section">
    {% for number in range(5, 0, -1) -%}
        <a class="rating-star default-hollow" target="_blank" href="https://cloud-native-dev-course-feedback.cfapps.sap.hana.ondemand.com/rating/{{ resource }}/submit?rating={{ number }}"></a>
    {%- endfor %}
    </div>
</div>