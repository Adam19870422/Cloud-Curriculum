{#- 
Snippet Usage:

{% with resource="some-unique-id-for-rating-backend" -%}
{%- include 'snippets/rating.md' -%}
{%- endwith %}

-#}
(Rate this: 
{% for number in range(1, 6) -%}
<a class="rating-star" target="_blank" href="https://cloud-native-dev-course-feedback.cfapps.sap.hana.ondemand.com/rating/{{ resource }}/submit?rating={{ number }}"></a>
{%- endfor %})