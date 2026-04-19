package com.brogress.config;

import javax.sql.DataSource;
import liquibase.integration.spring.SpringLiquibase;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

/**
 * Fallback if {@code LiquibaseAutoConfiguration} does not register a {@link SpringLiquibase} bean
 * (e.g. classpath or condition quirks). When auto-config runs, this bean is skipped.
 */
@Configuration
public class LiquibaseConfig {

  private static final String DEFAULT_CHANGELOG = "classpath:/db/changelog/db.changelog-master.xml";

  @Bean
  @ConditionalOnMissingBean(SpringLiquibase.class)
  public SpringLiquibase springLiquibase(DataSource dataSource, Environment env) {
    String changeLog =
        env.getProperty("spring.liquibase.change-log", env.getProperty("spring.liquibase.changeLog", DEFAULT_CHANGELOG));
    SpringLiquibase liquibase = new SpringLiquibase();
    liquibase.setDataSource(dataSource);
    liquibase.setChangeLog(changeLog);
    liquibase.setShouldRun(true);
    return liquibase;
  }
}
